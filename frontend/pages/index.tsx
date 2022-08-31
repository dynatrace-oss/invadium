// Copyright 2022 Dynatrace LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Portions of this code, as identified in remarks, are provided under the
// Creative Commons BY-SA 4.0 or the MIT license, and are provided without
// any warranty. In each of the remarks, we have provided attribution to the
// original creators and other attribution parties, along with the title of
// the code (if known) a copyright notice and a link to the license, and a
// statement indicating whether or not we have modified the code.

import React from "react";
import Overview, { OverviewProps } from "@components/Overview";
import { canonicalizeBackendUrl } from "@utils/UrlUtils";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import { SnackbarProvider } from "notistack";

const Home = ({ backendUrl }: OverviewProps) => {
  return (
    <SnackbarProvider maxSnack={3}>
      <Overview backendUrl={backendUrl}></Overview>
    </SnackbarProvider>
  );
};

Home.getInitialProps = async () => {
  const backendUrl = canonicalizeBackendUrl(publicRuntimeConfig.backendUrl);
  return { backendUrl: backendUrl };
};

export default Home;
