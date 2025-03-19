import React, { FC } from "react";
import {
  Select,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  OutlinedInput,
  Box,
} from "@mui/material";
import { ICategory } from "../../utils/types";

interface ICategoriesProps {
  categories: ICategory[];
  selectedCategories: number[];
  handleCategoryChange: (updatedCategories: number[]) => void;
}

const CategoriesSelect: FC<ICategoriesProps> = ({
  categories,
  selectedCategories,
  handleCategoryChange,
}) => {
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number[];
    handleCategoryChange(value);
  };

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="categories-select-label">Categories</InputLabel>
      <Select
        labelId="categories-select-label"
        multiple
        value={selectedCategories}
        onChange={handleChange}
        input={<OutlinedInput label="Categories" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {(selected as number[]).map((id) => (
              <Chip
                color={"primary"}
                variant={"filled"}
                key={id}
                label={categories.find((category) => category.id === id)?.name}
              />
            ))}
          </Box>
        )}
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategoriesSelect;
