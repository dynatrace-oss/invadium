# Copyright 2022 Dynatrace LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Portions of this code, as identified in remarks, are provided under the
# Creative Commons BY-SA 4.0 or the MIT license, and are provided without
# any warranty. In each of the remarks, we have provided attribution to the
# original creators and other attribution parties, along with the title of
# the code (if known) a copyright notice and a link to the license, and a
# statement indicating whether or not we have modified the code.

import secrets
import time

from app.core.config import settings
from kubernetes import client, config
from kubernetes.stream import stream


class K8sContainerManager:
    def __init__(self):
        config.load_incluster_config()
        self.k8s_api = client.CoreV1Api()

    def start_container(
        self, image: str, namespace: str = settings.INVADIUM_KUBERNETES_NAMESPACE
    ) -> str:
        # generate a unique name for the pod
        pod_name = secrets.token_hex(31)

        metadata = client.V1ObjectMeta(name=pod_name)

        resources = client.V1ResourceRequirements(
            requests={
                "cpu": settings.INVADIUM_KUBERNETES_POD_CPU_REQUESTS,
                "memory": settings.INVADIUM_KUBERNETES_POD_MEMORY_REQUESTS,
            },
            limits={
                "cpu": settings.INVADIUM_KUBERNETES_POD_CPU_LIMITS,
                "memory": settings.INVADIUM_KUBERNETES_POD_MEMORY_LIMITS,
            },
        )
        container = client.V1Container(
            name=pod_name,
            image=image,
            resources=resources,
            command=["/bin/sh", "-c", "while :; do sleep 86400; done"],
        )
        pod_spec = client.V1PodSpec(containers=[container])

        pod_body = client.V1Pod(
            metadata=metadata, spec=pod_spec, kind="Pod", api_version="v1"
        )

        self.k8s_api.create_namespaced_pod(body=pod_body, namespace=namespace)

        while True:
            api_response = self.k8s_api.read_namespaced_pod(
                name=pod_name, namespace=namespace
            )
            if api_response.status.phase != "Pending":
                break
            time.sleep(0.05)

        return pod_name

    def stop_container(
        self, container_id: str, namespace: str = settings.INVADIUM_KUBERNETES_NAMESPACE
    ) -> None:
        self.k8s_api.delete_namespaced_pod(container_id, namespace)

    def get_status(
        self, container_id: str, namespace: str = settings.INVADIUM_KUBERNETES_NAMESPACE
    ) -> str:
        api_response = self.k8s_api.read_namespaced_pod(
            name=container_id, namespace=namespace
        )
        return api_response.status.phase

    def exec_and_stream_logs(
        self,
        container_id: str,
        command: str,
        env: dict[str, str],
        namespace: str = settings.INVADIUM_KUBERNETES_NAMESPACE,
    ):
        env_command = ""
        is_first = True
        for key, value in env.items():
            value = value.replace('"', '\\"')
            if is_first:
                env_command = f"export {key}={value}"
                is_first = False
            else:
                env_command = env_command + f' && export {key}="{value}"'
        exec_command = ["sh", "-c", f"{env_command} && {command}"]
        resp = stream(
            self.k8s_api.connect_get_namespaced_pod_exec,
            container_id,
            namespace,
            command=exec_command,
            stderr=True,
            stdin=True,
            stdout=True,
            tty=False,
            _preload_content=False,
        )
        return resp
