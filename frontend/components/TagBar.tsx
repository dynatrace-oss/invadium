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

import { Autocomplete, TextField } from "@mui/material";
import Tag from "@components/Tag";

interface TagBarProps {
  tags: string[];
  filterTags: string[];
  setFilters: Function;
}

/*
 * Allows to filter for tags in the overview.
 */
const TagBar = ({ tags, filterTags, setFilters }: TagBarProps) => {
  return (
    <Autocomplete
      id="free-solo-2-demo"
      options={tags}
      multiple
      value={filterTags}
      filterSelectedOptions
      isOptionEqualToValue={(option, value) => option === value}
      renderTags={(value) =>
        value.map((option, index) => (
          <Tag
            key={index}
            tag={option}
            addFilter={() => {
              /* nothing */
            }}
            deleteTagHandler={() => {
              setFilters(
                filterTags.filter((filterTag) => filterTag !== option)
              );
            }}
          ></Tag>
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter by tags"
          InputProps={{
            ...params.InputProps,
            type: "search",
          }}
        />
      )}
      onChange={(event, value) => setFilters(value)}
    />
  );
};

export default TagBar;
