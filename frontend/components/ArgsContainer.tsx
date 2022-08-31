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

import {
  Button,
  Collapse,
  IconButton,
  Input,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { EnvVar } from "@components/ExploitPage";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import getConfig from "next/config";
import ExpandMore from "@components/ExpandMore";
import { canonicalizeBackendUrl } from "@utils/UrlUtils";
const { publicRuntimeConfig } = getConfig();

interface ArgsContainerProps {
  containerId: string;
  stepId: string;
  updateEnvVariable: Function;
  enqueueSnackbar: Function;
}

/*
 * RegEx pattern to check for URLs, https://stackoverflow.com/a/5717133/927377
 * (c) Apr 19, 2011 Tom Gullen & Aryan Beezadhur
 * Dynatrace has made changes to this code snippet. This code snippet is supplied without warranty,
 * and is available under the Creative Commons BY-SA 4.0 license (CC BY-SA 4.0).
 */
const validURL = (str: string) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i"
  );
  return pattern.test(str);
};

const getCanonicalUrl = (initialUrl: string) => {
  if (initialUrl.includes("http") || initialUrl.includes("https")) {
    return initialUrl;
  }
  return `http://${initialUrl}`;
};

/*
 * Displays environment variables with their name, value, and description.
 * Upon expansion, allows to modify them interactively.
 */
const ArgsContainer = ({
  containerId,
  stepId,
  updateEnvVariable,
  enqueueSnackbar,
}: ArgsContainerProps) => {
  const [stepEnvVars, setStepEnvVars] = useState<EnvVar[]>([]);
  const [expanded, setExpanded] = useState<boolean>(stepId === "");
  const [isUrl, setIsUrl] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  );
  const exploitScope = stepId === "";
  const BACKEND_API = canonicalizeBackendUrl(publicRuntimeConfig.backendUrl);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const setStepEnvVar = (idx: number, value: string) => {
    stepEnvVars[idx].value = value;
    setStepEnvVars(stepEnvVars);
  };

  useEffect(() => {
    const fetchStepEnvVars = async () => {
      if (containerId === "") {
        return;
      }
      const res = await fetch(
        `${BACKEND_API}/environment/${
          exploitScope ? "exploit" : "step"
        }?container_id=${containerId}&step_id=${stepId}`
      );
      if (res.status !== 200) {
        return;
      }
      const dict = await res.json();
      const envVariables = [];
      const isUrlMap = new Map<string, boolean>();
      for (const key in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
          envVariables.push(dict[key]);

          isUrlMap.set(dict[key].value, validURL(dict[key].value));
        }
      }
      setStepEnvVars(envVariables);
      setIsUrl(isUrlMap);
    };
    fetchStepEnvVars().catch((err) => console.log(err));
  }, [containerId, stepId, exploitScope, BACKEND_API]);

  const handleSaveButtonClick = async () => {
    for await (const stepEnvVar of stepEnvVars) {
      await updateEnvVariable(
        containerId,
        stepEnvVar.name,
        stepEnvVar.value,
        stepId
      );
    }
    enqueueSnackbar("Updated exploit arguments", { variant: "success" });
  };

  return (
    <Box className="my-2 ">
      <Stack
        direction="row"
        justifyContent="left"
        alignContent="center"
        alignItems="center"
        className="mb-1"
        width="100%"
      >
        <ExpandMore
          expand={+expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
        <Typography maxWidth="200px" sx={{ whiteSpace: "pre-wrap" }}>
          {exploitScope ? "Exploit arguments: " : "Arguments: "}
        </Typography>
        <Box maxWidth="100%">
          <Collapse
            in={!expanded}
            orientation="horizontal"
            timeout="auto"
            unmountOnExit
          >
            <Typography
              component="span"
              align="left"
              alignSelf="center"
              noWrap
              maxWidth="20vw"
              display="block"
            >
              {stepEnvVars
                .map((arg) => {
                  return `${arg.name}=${arg.value}`;
                })
                .join(", ")}
            </Typography>
          </Collapse>
        </Box>
      </Stack>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stepEnvVars.map((stepEnvVar, idx) => (
                <TableRow
                  key={stepEnvVar.name}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{stepEnvVar.name}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      <Input
                        sx={{ width: "100%" }}
                        defaultValue={stepEnvVar.value}
                        onChange={(ev) => setStepEnvVar(idx, ev.target.value)}
                      ></Input>
                      {isUrl.get(stepEnvVar.value) && (
                        <IconButton
                          href={getCanonicalUrl(stepEnvVar.value)}
                          target="_blank"
                        >
                          <OpenInNewIcon></OpenInNewIcon>
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{stepEnvVar.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            className="float-right m-3"
            onClick={handleSaveButtonClick}
          >
            Save changes
          </Button>
        </TableContainer>
      </Collapse>
    </Box>
  );
};

export default ArgsContainer;
