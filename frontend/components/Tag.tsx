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

import { Box, Chip } from "@mui/material";

interface TagProps {
  tag: string;
  addFilter: Function;
  deleteTagHandler?: Function;
}

// when this characters is used in tags, the left part is shown
// as the key and the right part is shown as the value
const KEY_VALUE_DELIMITER = "::";

/*
 * Shows a single tag that might has been applied to some exploit.
 */
const Tag = ({ tag, addFilter, deleteTagHandler }: TagProps) => {
  const clickHandler: Function = (tag: string) => {
    addFilter(tag);
  };

  return (
    <Chip
      size="small"
      color="primary"
      variant="outlined"
      className="mb-1 border-0"
      sx={{
        "& .MuiChip-label": {
          padding: 0.5,
        },
      }}
      label={
        <Box sx={{ width: "100%" }}>
          {tag.split(KEY_VALUE_DELIMITER).length === 2 && (
            <Chip
              label={tag.split(KEY_VALUE_DELIMITER)[0]}
              size="small"
              color="primary"
              onClick={
                deleteTagHandler === undefined
                  ? () => clickHandler(tag)
                  : undefined
              }
              className="m-0 p-1 rounded-r-none"
            />
          )}
          <Chip
            label={
              tag.split(KEY_VALUE_DELIMITER).length === 2
                ? tag.split(KEY_VALUE_DELIMITER)[1]
                : tag
            }
            sx={{
              "& .MuiChip-deleteIcon": {
                marginLeft: 0,
              },
            }}
            variant="outlined"
            size="small"
            color="primary"
            onDelete={
              deleteTagHandler !== undefined
                ? () => {
                    deleteTagHandler();
                  }
                : undefined
            }
            onClick={
              deleteTagHandler === undefined
                ? () => clickHandler(tag)
                : undefined
            }
            className={`m-0 p-1 ${
              tag.split(KEY_VALUE_DELIMITER).length === 2
                ? "rounded-l-none "
                : ""
            }`}
          />
        </Box>
      }
    ></Chip>
  );
};

export default Tag;
