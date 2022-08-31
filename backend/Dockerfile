FROM python:3.10-slim

WORKDIR /code

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY app /code/app

ENV INVADIUM_CONFIG_PATH=/config

CMD ["python", "-m", "app", "--no-debug"]
