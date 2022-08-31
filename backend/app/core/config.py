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

import re
from typing import List, Literal, Optional

from pydantic import AnyHttpUrl, BaseSettings, validator


class Settings(BaseSettings):
    # Path where the exploit config YAML files are located
    INVADIUM_CONFIG_PATH: str

    # Prefix that is appended to API routes and the docs.
    # E.g., with "/api" you can then call localhost:3001/api/exploits
    INVADIUM_API_ROOT: str = "/api"

    # Port where the Invadium API will listen
    INVADIUM_API_PORT: int = 30001

    # Origins that are allowed to call the backend. Put in the URL
    # of the frontend if it has a different origin than the backend.
    INVADIUM_CORS_ORIGINS: List[AnyHttpUrl] = []

    # Defines if new exploits will spawn "docker" containers
    # or new exploits spawn "kubernetes" pods
    INVADIUM_EXPLOIT_RUNTIME: Literal["docker", "kubernetes"] = "docker"

    # Amount of seconds after an idle exploit container is deleted
    INVADIUM_EXPLOIT_TIMEOUT: int = 900  # 15min

    # Spawns containers in a certain "--network"
    # (when the "docker" runtime is selected), e.g.,
    # this can be set to "host" to spawn exploit containers
    # in the same network as the Docker host
    INVADIUM_DOCKER_NETWORK: Optional[str] = None

    # Kubernetes namespace where new exploit pods are spawned
    # (when the "kubernetes" runtime is selected)
    INVADIUM_KUBERNETES_NAMESPACE: str = "invadium"

    # The CPU and memory requests and limits on new exploit pods
    # (when the "kubernetes" runtime is selected)
    INVADIUM_KUBERNETES_POD_CPU_REQUESTS: str = "100m"
    INVADIUM_KUBERNETES_POD_CPU_LIMITS: str = "250m"
    INVADIUM_KUBERNETES_POD_MEMORY_REQUESTS: str = "250Mi"
    INVADIUM_KUBERNETES_POD_MEMORY_LIMITS: str = "500Mi"

    @validator("INVADIUM_API_ROOT")
    def no_trailing_slashes_in_api_root(cls, value: str):
        return re.sub("/$", "", value)

    @validator("INVADIUM_DOCKER_NETWORK")
    def no_empty_docker_network(cls, value: Optional[str]):
        return value if value else None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
