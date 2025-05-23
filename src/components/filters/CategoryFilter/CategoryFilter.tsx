import React from 'react';
import {Checkbox, FormControlLabel, FormGroup} from '@mui/material';
import {ICategory} from "../../../utils/types";
//TODO Зробити фільтр сбоку

interface ICategoryFilterProps {
    selectedFilterCategories: number[];
    handleCategoryFilterChange: (categoryID: number) => void;
    categories: ICategory[];
}

const CategoryFilter: React.FC<ICategoryFilterProps> = ({
                                                            selectedFilterCategories,
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
                            checked={selectedFilterCategories.includes(category.id)}
                            onChange={() => handleCategoryFilterChange(category.id)}
                        />
                    }
                    title={category.name}
                    label={category.name}
                />
            ))}
        </FormGroup>
    );
};

export default CategoryFilter;
