# Invadium Development Guide

Welcome onboard, contributor!
Here is the TL;DR version on what follows below:

1. Please setup [pre-commit](https://pre-commit.com/) hooks and our
   [EditorConfig](https://editorconfig.org/) for consistent code style.
2. When working locally with Docker, start the frontend with `npm run dev` and
   the backend with `python -m app --debug` - both should reload automatically
   on source code changes.
3. If you want experiment with a Kubernetes cluster, we recommend to setup a
   [Kind](https://kind.sigs.k8s.io/) cluster and deploy with
   [Skaffold](https://skaffold.dev/). Please head over to this separate
   Kubernetes guide [over here](.\KUBERNETES.md).

## Prerequisites

You will need the following tools to get started:

- [Python](https://www.python.org/downloads/) for developing the backend
- [Node.js](https://nodejs.org/en/download/) for developing the frontend
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or a similar container runtime
- _(optional)_ [Docker Compose](https://docs.docker.com/compose/install/) if you want to use it for simple local deployment
- _(optional)_ [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) or a similar if you want to experiment with a local cluster
- _(optional)_ [Skaffold](https://skaffold.dev/docs/install/) for deploying in your local Kubernetes cluster
- _(optional)_ [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with your local cluster
- _(optional)_ [pre-commit](https://pre-commit.com/#install) installed globally or in the same environment as the backend
- _(optional)_ [EditorConfig](https://editorconfig.org/#download) for your IDE to ensure consistent code style

### 1. Install package dependencies

Let Node install the packages in the frontend.

```sh
cd frontend
npm install
```

For the backend, we recommend to create a new virtual environment.

```sh
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt -r requirements.dev.txt
```

On Windows, use `.\.venv\Scripts\Activate.ps1` instead.

### 2. Setup pre-commit hooks

You can either re-use the Python environment that you just created for the
backend or install `pre-commit` globally. Ensure that you did run `npm install`
in the frontend because some hooks depend on that.

```sh
pip install pre-commit
pre-commit install
```

That's it, pre-commit hooks will automatically run before your next commit.

## 💻 Local Development

**The quickest and recommend way to develop is to directly start the Python and
Node.js apps in development mode.**

Start the backend with the following command. It can be configured with the
environment variables from [`.env`](../backend/.env) in the backend directory.
By default, and different to the Kubernetes deployment, there is no API prefix
set.

```sh
cd backend
python -m app --debug
```

**Reach the backend at [localhost:3001](http://localhost:3001)** - the Swagger
docs are also available at that location.

Start the frontend with the following command. It can be configured with the
environment variables from [`.env.development`](../frontend/.env.development) in
the frontend directory. The [`.env.production`](../frontend/.env.production) is
used for building the final production container instead.

```sh
cd frontend
npm run dev
```

**Visit the frontend at [localhost:3000](http://localhost:3000)**

## 🐋 Local Deployment with Docker

We prepared a [`docker-compose.yaml`](../docker-compose.yaml) in the repository
root that is already configured to start both the frontend and backend
containers correctly configured. Those will not auto-reload, so this is meant
for quickly testing a production build locally.

With the `--no-build` argument, it will pull the latest stable build of Invadium
and start the containers directly.

```sh
docker-compose up --no-build -d
```

If you instead want to build the containers based upon your current changes,
supply the `--build` argument instead.

```sh
docker-compose up --build -d
```

### Building the container images manually

You may also build the container images manually. Ensure that you supply the
required environment variables when you start the containers manually.
Especially the frontend needs a relative or absolute URL to the backend that is
reachable from a browser window, set it with `NEXT_BACKEND_API_URL`.

```sh
cd backend
docker build -t invadium-backend .

cd frontend
docker build -t invadium-frontend .
```

## Developer FAQ

### Where are the docs for the WebSocket endpoint to stream exploit logs?

Yes, sorry, the automated docs don't pick that one up. Here you go.

1. Connect to **`ws://your-backend-hostname:3001/exploits/ws-logs`**
2. Send the following JSON payload, where the `container_id` is the one that you
   get from `POST /exploits/start` and the `step_id` is the ID that you see in
   `GET /exploits` or in your exploit YAML file.

   ```json
   { "container_id": "CONTAINER_ID", "step_id": "STEP_ID" }
   ```

3. You will receive the logs in plain-text

You can also experiment with this locally, e.g. with
[`wscat`](https://www.npmjs.com/package/wscat)

```sh
$ wscat -c "wss://your-backend-hostname:3001/exploits/ws-logs"
Connected (press CTRL+C to quit)
> { "container_id": "331...5f5", "step_id": "nmap_scan" }
< Starting Nmap 7.92 ( https://nmap.org ) at 2022-08-17 19:22 UTC
< Nmap scan report for scanme.nmap.org (45.33.32.156)
< Host is up (0.093s latency).
< Other addresses for scanme.nmap.org (not scanned): 2600:3c01::f03c:91ff:fe18:bb2f
< Not shown: 891 closed tcp ports (reset), 105 filtered tcp ports (no-response)
< PORT      STATE SERVICE
< 22/tcp    open  ssh
< 80/tcp    open  http
< 9929/tcp  open  nping-echo
< 31337/tcp open  Elite
< Nmap done: 1 IP address (1 host up) scanned in 32.50 seconds
```
