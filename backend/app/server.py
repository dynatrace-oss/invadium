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

import uvicorn
from app.api.api import api_router
from app.core.config import settings
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)


def create_app(debug: bool):
    app = FastAPI(
        title="Invadium",
        debug=debug,
        openapi_url=f"{settings.INVADIUM_API_ROOT}/openapi.json",
        docs_url=settings.INVADIUM_API_ROOT if settings.INVADIUM_API_ROOT else "/",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.INVADIUM_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    return app


def production_app():
    return create_app(debug=False)


def development_app():
    return create_app(debug=True)


def run_server(debug: bool = False):
    app_name = "production_app" if not debug else "development_app"
    uvicorn.run(
        f"{__name__}:{app_name}",
        factory=True,
        host="0.0.0.0",
        port=settings.INVADIUM_API_PORT,
        reload=debug,
    )
