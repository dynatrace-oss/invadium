# Invadium Kubernetes Deployment

Invadium can also be run inside a Kubernetes cluster and spawn pods with the
exploit containers in them. The following steps explain how this can be achieved
with a local [Kind](https://kind.sigs.k8s.io/) cluster. Feel free to adapt this
to your specific requirements.

## Prerequisites

You will need the following tools to get started:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) because Kind creates the cluster that way
- [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/) or a similar local cluster environment
- [Skaffold](https://skaffold.dev/docs/install/) for building, pushing, and deploying to your cluster
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with your cluster

## ⚓ Kubernetes Deployment

Create a new Kind cluster with ingresses enabled.

```sh
kind create cluster --name invadium --config ./k8s-manifests/localdev/kind/cluster-config.yaml
```

If your Kind cluster exists already, activate it.

```sh
kubectl config use-context kind-invadium
```

Deploy the ingress controller in that cluster and wait for it to be ready. This
step is only necessary for Kind clusters.

```sh
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/helm-chart-4.2.1/deploy/static/provider/kind/deploy.yaml
kubectl wait -n ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s
```

Build and deploy Invadium. If you named your cluster `invadium` your context
will be named `kind-invadium` and Skaffold will already select the `-p localdev`
profile that will deploy specific resources for your Kind cluster.

```sh
skaffold run
```

To make domains work locally, edit your `/etc/hosts` file accordingly and
**visit [http://invadium.kube](http://invadium.kube) next**. To apply changes
immediately, you want to flush sockets, e.g. at
`chrome://net-internals/#sockets` for Chrome.

```text
127.0.0.1 invadium.kube
```

## Kubernetes FAQ

### How can I clean-up the deployed resources?

Skaffold can undeploy everything for you. Also the namespace.

```sh
skaffold delete
```

You can also delete the entire Kind cluster.

```sh
kind delete cluster --name invadium
```

### How do my YAML files end up in the backend pod?

We recommend to create a
[PersistentVolumeClaim](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)
and copy the files into the container after the deployment.

Skaffold already takes care of copying data into that by calling
[`copy-data.sh`](../k8s-manifests/hooks/copy-data.sh) on Linux, and
[`copy-data.ps1`](../k8s-manifests/hooks/copy-data.ps1) on Windows,
respectively. The backend is then instructed to refresh its configuration via a
REST API call.

If you only update the exploit formats, you can call this script directly
instead of re-deploying all resources.

```sh
./k8s-manifests/hooks/copy-data.sh /path/to/exploits/config
```

### How is the backend pod restricted in its ability to spawn exploits?

The backend pod uses the [`invadium-backend-sa`](../k8s-manifests/localdev/sa.yaml)
service account that allows it to manage `pods` and `pods/exec` resources.

### How can I adapt this to my cluster?

The most simple way would be that you fork this repository and adapt the
manifests to your needs. You probably want to copy and adapt the manifests for
the config, ingress, volume claims, and service account from
[`./k8s-manifests/localdev`](../k8s-manifests/localdev) to your specific
requirements.

As an alternative, you can have a second repository that inherits from the
[`skaffold.yaml`](../skaffold.yaml) in this repository and add your profiles.
You can achieve this like so:

```yaml
apiVersion: skaffold/v2beta29
kind: Config
metadata:
  name: invadium-internal
requires:
  - git:
      repo: git@github.com:dynatrace-oss/invadium.git
# ...
```
