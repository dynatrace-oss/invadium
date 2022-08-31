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

import logging

import docker
from app.core.config import settings
from docker.errors import ImageNotFound
from docker.models.containers import ExecResult


class DockerContainerManager:
    def __init__(self):
        self.docker_client = docker.from_env()

    def start_container(self, image: str) -> str:
        try:
            self.docker_client.images.pull(repository=image)
        except ImageNotFound:
            logging.info(f"Image {image} could not be pulled")

        return self.docker_client.containers.run(
            image=image,
            detach=True,
            tty=True,
            auto_remove=True,
            network=settings.INVADIUM_DOCKER_NETWORK,
            entrypoint=["/bin/sh", "-c", "while :; do sleep 86400; done"],
        ).id

    def get_status(self, container_id: str) -> str:
        return self.docker_client.containers.get(container_id).status

    def exec_and_stream_logs(
        self, container_id: str, command: str, env: dict[str, str]
    ) -> ExecResult:
        return self.docker_client.containers.get(container_id).exec_run(
            f"sh -c '{command}'", stream=True, environment=env
        )

    def stop_container(self, container_id: str) -> None:
        self.docker_client.containers.get(container_id).stop(timeout=0)
