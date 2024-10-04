import {Checkbox, FormControlLabel, FormGroup, Grid} from "@mui/material";
import {FC} from "react";
import {ICategory} from "../../utils/types";

interface ICategoriesProps {
    categories: ICategory[]; // Можна уточнити тип категорій
    selectedCategories: number[];
    handleCategoryChange: (id: number) => void;
}

const CategoriesSelect: FC<ICategoriesProps> = ({
                                                    categories,
                                                    selectedCategories,
                                                    handleCategoryChange,
                                                }) => (
    <FormGroup>
        <Grid container>
            {categories.map((category) => (
                <Grid item xs={12} md={3} lg={4} key={category.id+category.name}><FormControlLabel

                    control={
                        <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                        />
                    }
                    label={category.name}
                /></Grid>
            ))}</Grid>
    </FormGroup>
);

export default CategoriesSelect