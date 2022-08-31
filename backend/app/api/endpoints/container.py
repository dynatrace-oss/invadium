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

import docker.errors
from app.core.config import settings
from app.logic.docker_container_manager import DockerContainerManager
from app.logic.k8s_container_manager import K8sContainerManager
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

if settings.INVADIUM_EXPLOIT_RUNTIME == "docker":
    container_manager = DockerContainerManager()
elif settings.INVADIUM_EXPLOIT_RUNTIME == "kubernetes":
    container_manager = K8sContainerManager()


@router.get("/status")
async def get_status_from_container(
    container_id: str = Query(description="The container id"),
) -> str:
    """
    Returns the status of the specified container

    :param container_id: The container id
    :return: The status of the specified container
    """
    try:
        return container_manager.get_status(container_id)
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Container not found")
