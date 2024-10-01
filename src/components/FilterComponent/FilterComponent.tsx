import React from 'react';
import {Button, Grid} from "@mui/material";
import CategoryFilter from "../CategoryFilter/CategoryFilter";
import SupplierFilter from "../SupplierFilter/SupplierFilter";


interface IFilterComponentProps {
    selectedFilterCategories: number[];
    handleCategoryFilterChange: (categoryID: number) => void;
    categories: any[]; // TODO: create type interface

    selectedFilterSuppliers: number[];
    handleSupplierFilterChange: (supplierID: number) => void;
    suppliers: any[]; // TODO: create type interface

    applyFilters: (categoryIDs: number[], supplierIDs: number[]) => void;
    setSelectedFilterCategories: (categoryIDs: number[]) => void;
    setSelectedFilterSuppliers: (supplierIDs: number[]) => void;
}

const FilterComponent = ({
                             applyFilters,
                             handleCategoryFilterChange,
                             categories,
                             handleSupplierFilterChange,
                             selectedFilterCategories,
                             selectedFilterSuppliers,
                             suppliers,
                             setSelectedFilterCategories,
                             setSelectedFilterSuppliers
                         }: IFilterComponentProps) => {
    return (
        <Grid container>
            <Grid item xs={12}>
                <h2>Фільтри</h2>
                <div>
                    <div>
                        <h3>Категорії</h3>
                        <CategoryFilter
                            selectedFilterCategories={selectedFilterCategories}
                            handleCategoryFilterChange={handleCategoryFilterChange}
                            categories={categories}
                        />
                    </div>
                    <div>
                        <h3>Постачальники</h3>
                        <SupplierFilter
                            selectedFilterSuppliers={selectedFilterSuppliers}
                            handleSupplierFilterChange={handleSupplierFilterChange}
                            suppliers={suppliers}
                        />
                    </div>

                </div>
                <Button variant={"contained"} onClick={() => {
                    setSelectedFilterCategories([]);
                    setSelectedFilterSuppliers([]);
                    applyFilters([], []);
                }}>
                    Очистити
                </Button>
            </Grid>

        </Grid>

    );
};

export default FilterComponent;
