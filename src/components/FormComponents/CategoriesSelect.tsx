import {Checkbox, FormControlLabel, FormGroup} from "@mui/material";
import {FC} from "react";

interface ICategoriesProps {
  categories: any[]; // Можна уточнити тип категорій
  selectedCategories: number[];
  handleCategoryChange: (id: number) => void;
}

const CategoriesSelect: FC<ICategoriesProps> = ({
  categories,
  selectedCategories,
  handleCategoryChange,
}) => (
  <FormGroup>
    {categories.map((category) => (
      <FormControlLabel
        key={category.id}
        control={
          <Checkbox
            checked={selectedCategories.includes(category.id)}
            onChange={() => handleCategoryChange(category.id)}
          />
        }
        label={category.name}
      />
    ))}
  </FormGroup>
);

export default CategoriesSelect