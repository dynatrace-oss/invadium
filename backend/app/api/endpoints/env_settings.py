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

from app.api.endpoints import exploit
from app.logic.exploit_manager import ExploitManager
from app.logic.util import convert_error_to_str
from app.models.environment_var import EnvironmentVar
from fastapi import APIRouter, HTTPException

router = APIRouter()
exploit_manager: ExploitManager = exploit.exploit_manager


@router.get("/exploit", response_model=dict[str, EnvironmentVar])
async def get_exploit_env_settings(container_id: str) -> dict[str, EnvironmentVar]:
    try:
        return exploit_manager.get_exploit_env(container_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=convert_error_to_str(e))


@router.patch("/exploit", response_model=EnvironmentVar)
async def set_exploit_env(
    container_id: str, env_name: str, new_value: str
) -> EnvironmentVar:
    try:
        return exploit_manager.set_exploit_env(container_id, env_name, new_value)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=convert_error_to_str(e))


@router.get("/step", response_model=dict[str, EnvironmentVar])
async def get_step_env_settings(
    container_id: str, step_id: str
) -> dict[str, EnvironmentVar]:
    try:
        return exploit_manager.get_step_env(container_id, step_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=convert_error_to_str(e))


@router.patch("/step", response_model=EnvironmentVar)
async def set_step_env(
    container_id: str, step_id: str, env_name: str, new_value: str
) -> EnvironmentVar:
    try:
        return exploit_manager.set_step_env(container_id, step_id, env_name, new_value)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=convert_error_to_str(e))
