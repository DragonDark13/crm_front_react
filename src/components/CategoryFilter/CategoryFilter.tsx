import React from 'react';
import {Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import {ICategory} from "../../App"; // імпорт функції для отримання категорій

interface ICategoryFilterProps {
    selectedCategories: number[];
    handleCategoryFilterChange: (categoryID: number) => void;
    categories: ICategory[];
}

const CategoryFilter: React.FC<ICategoryFilterProps> = ({
                                                            selectedCategories,
                                                            handleCategoryFilterChange,
                                                            categories
                                                        }) => {


    return (
        <FormGroup>
            {categories.map(category => (
                <FormControlLabel
                    key={category.id}
                    control={
                        <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryFilterChange(category.id)}
                        />
                    }
                    label={category.name}
                />
            ))}
        </FormGroup>
    );
};

export default CategoryFilter;
