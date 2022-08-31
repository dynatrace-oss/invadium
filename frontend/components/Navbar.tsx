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

import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import Image from "next/image";

import { useRouter } from "next/router";
import React from "react";

import invadiumLogo from "@public/invadium-logo.svg";

/*
 * The top navbar which is shown at all time.
 */
const Navbar = () => {
  const router = useRouter();

  const NavButton = (props: { name: string; path: string }) => (
    <Button
      color="inherit"
      className="ml-2 pt-2"
      onClick={() => router.push(props.path)}
    >
      {props.name}
    </Button>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#4D7CB2" }}>
        <Toolbar>
          <Box
            className="shadow-md content-center justify-center"
            sx={{ display: { xs: "none", md: "flex" }, mr: 2 }}
          >
            <Image
              src={invadiumLogo}
              alt="Invadium Logo"
              width="40"
              height="40"
            ></Image>
          </Box>
          <Typography variant="h6" className="header">
            Invadium
          </Typography>
          <Box sx={{ ml: 5 }}>
            <NavButton name="Overview" path="/" />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};
export default Navbar;
