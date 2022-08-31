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

from app.api.endpoints import config_ressource, container, env_settings, exploit
from app.core.config import settings
from fastapi import APIRouter

api_router = APIRouter(prefix=settings.INVADIUM_API_ROOT)
api_router.include_router(container.router, prefix="/containers", tags=["containers"])
api_router.include_router(exploit.router, prefix="/exploits", tags=["exploits"])
api_router.include_router(
    env_settings.router, prefix="/environment", tags=["environment"]
)
api_router.include_router(config_ressource.router, prefix="/config", tags=["config"])
