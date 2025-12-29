import React, {FC, ReactNode} from "react";
import {
    Select,
    MenuItem,
    Chip,
    FormControl,
    InputLabel,
    OutlinedInput,
    Box, SelectChangeEvent,
} from "@mui/material";
import {ICategory, IGiftSet} from "../../utils/types";

interface ICategoriesProps {
    categories: ICategory[];
    selectedCategories: number[];
    handleRemoveCategory: (idToRemove: number) => void;
    handleCategoryChange: (updatedCategories: number[]) => void;
}

const CategoriesSelect: FC<ICategoriesProps> = ({
                                                    categories,
                                                    selectedCategories,
                                                    handleCategoryChange,
                                                    handleRemoveCategory
                                                }) => {
    const handleChange = (event: SelectChangeEvent<number[]>, child: ReactNode) => {
        const value = event.target.value as number[];
        handleCategoryChange(value);
    };


    return (
        <FormControl size={"small"} fullWidth variant="outlined">
            <InputLabel size={"small"} id="categories-select-label">Категорії</InputLabel>
            <Select
                size={"small"}
                labelId="categories-select-label"
                multiple
                value={selectedCategories}
                onChange={handleChange}
                input={<OutlinedInput label="Categories"/>}
                renderValue={(selected) => (
                    <Box sx={{display: "flex", flexWrap: "wrap", gap: 0.5}}>
                        {(selected as number[]).map((id) => (
                            <Chip
                                onDelete={(event) => {
                                    event.stopPropagation(); // Не обов'язково тут, але не завадить
                                    handleRemoveCategory(id);
                                }}
                                onMouseDown={(event) => {
                                    event.stopPropagation(); // 🛑 запобігає відкриттю Select
                                }}
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
