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

import React, { useEffect, useState } from "react";
import {
  Backdrop,
  CircularProgress,
  Container,
  Fade,
  Grid,
} from "@mui/material";
import { useRouter } from "next/router";
import ExploitCard from "@components/ExploitCard";
import TagBar from "@components/TagBar";
import { useSnackbar } from "notistack";

export interface ExploitInfo {
  id: string;
  name: string;
  desc: string;
  image: string;
  tags: string[];
  links: string[];
}

export interface OverviewProps {
  backendUrl: string;
}

/*
 * Shows an overview of the available exploits that can be run.
 */
const Overview = ({ backendUrl }: OverviewProps) => {
  const router = useRouter();
  const [exploits, setExploits] = useState<ExploitInfo[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [containerCreationInProgress, setContainerCreationInProgress] =
    useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const BACKEND_HOSTNAME = backendUrl;

  useEffect(() => {
    const fetchExploits = async () => {
      const response = await fetch(`${BACKEND_HOSTNAME}/exploits`);
      const data: ExploitInfo[] = await response.json();
      setExploits(data);
    };

    fetchExploits().catch(console.error);
  }, [BACKEND_HOSTNAME]);

  const startExploitContainer = async (exploitId: string) => {
    const url = `${BACKEND_HOSTNAME}/exploits/start?exploit_id=${exploitId}`;
    const response = await fetch(url, { method: "POST" });
    return response.json();
  };

  useEffect(() => {
    const getTags = () => {
      let tagsOfExploits = exploits.map((ex) => ex.tags).flat();
      tagsOfExploits = tagsOfExploits.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
      setTags(tagsOfExploits);
    };
    getTags();
  }, [exploits]);

  const handleStartRequest = (exploitId: string) => {
    setContainerCreationInProgress(true);
    startExploitContainer(exploitId).then((containerId) => {
      setContainerCreationInProgress(false);
      router.push({
        pathname: "/detail",
        query: {
          exploitParam: exploitId,
          containerParam: containerId,
          exploitName: getExploitName(exploitId),
        },
      });
    });
  };

  const setFilters = (tagNames: string[]) => {
    if (tagNames == undefined) {
      setFilterTags([]);
    }
    setFilterTags(tagNames);
  };

  const addFilter = (tagName: string) => {
    if (tagName === undefined) {
      return;
    }
    if (filterTags.includes(tagName)) {
      enqueueSnackbar(`Already filtering by tag ${tagName}`, {
        variant: "info",
      });
      return;
    }
    setFilterTags([...filterTags, tagName]);
  };

  const getExploitName = (exploitId: string) => {
    const exploit = exploits.find((e) => e.id == exploitId);
    return exploit !== undefined ? exploit.name : "";
  };

  /*
   * https://github.com/mui/material-ui/blob/v5.8.7/docs/data/material/components/backdrop/SimpleBackdrop.tsx
   * (c) 2014 Call-Em-All & individual contributors
   * Dynatrace has made changes to this code snippet. This code snippet is supplied
   * without warranty, and is available under The MIT License (MIT).
   */
  const backdrop = (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={containerCreationInProgress}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );

  return (
    <Container className="mt-6 pb-6">
      <TagBar
        tags={tags.filter((tag) => !filterTags.includes(tag))}
        filterTags={filterTags}
        setFilters={setFilters}
      ></TagBar>
      <Grid container spacing={3} className="mt-3">
        {exploits
          .filter(
            (exploit) =>
              filterTags.length == 0 ||
              filterTags.every((filterTag) => exploit.tags.includes(filterTag))
          )
          .map((exploit) => (
            <Fade in={true} appear={true} key={exploit.id}>
              <Grid item xs={12} sm={6} md={4} key={exploit.id}>
                <ExploitCard
                  key={exploit.name}
                  exploit={exploit}
                  startFunction={handleStartRequest}
                  addFilter={addFilter}
                ></ExploitCard>
              </Grid>
            </Fade>
          ))}
      </Grid>
      {backdrop}
    </Container>
  );
};
export default Overview;
