import React, { useState } from "react";
import {
    Grid,
    Typography,
    Slider,
    Button,
    Box,
    Collapse,
} from "@mui/material";
import SupplierFilter from "../SupplierFilter/SupplierFilter";
import CategoryFilter from "../CategoryFilter/CategoryFilter";

const Filters = ({
    filters,
    categories,
    suppliers,
    priceMax,
    filterArrayLength,
    handleFilterChange,
    resetFilters,
    isFiltersChanged,
    toggleFilter,
}) => {
    const [showCategoryFilter, setShowCategoryFilter] = useState(true);
    const [showSupplierFilter, setShowSupplierFilter] = useState(true);

    return (
        <Grid container px={2}>
            <Grid item xs={12}>
                <h2>Фільтри</h2>

                {/* Фільтр за категоріями */}
                <div>
                    <Button
                        variant="text"
                        onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    >
                        {showCategoryFilter ? "Сховати категорії" : "Показати категорії"}
                    </Button>
                    <Collapse in={showCategoryFilter}>
                        <div>
                            <h3>Категорії</h3>
                            <CategoryFilter
                                selectedFilterCategories={filters.categories}
                                handleCategoryFilterChange={(categoryID: number) => {
                                    const updatedCategories = toggleFilter(filters.categories, categoryID);
                                    handleFilterChange("categories", updatedCategories);
                                }}
                                categories={categories}
                            />
                        </div>
                    </Collapse>
                </div>

                {/* Фільтр за постачальниками */}
                <div>
                    <Button
                        variant="text"
                        onClick={() => setShowSupplierFilter(!showSupplierFilter)}
                    >
                        {showSupplierFilter ? "Сховати постачальників" : "Показати постачальників"}
                    </Button>
                    <Collapse in={showSupplierFilter}>
                        <div>
                            <h3>Постачальники</h3>
                            <SupplierFilter
                                selectedFilterSuppliers={filters.suppliers}
                                handleSupplierFilterChange={(supplierID: number) => {
                                    const updatedSuppliers = toggleFilter(filters.suppliers, supplierID);
                                    handleFilterChange("suppliers", updatedSuppliers);
                                }}
                                suppliers={suppliers}
                            />
                        </div>
                    </Collapse>
                </div>

                {/* Фільтр за ціною */}
                <Typography gutterBottom>Фільтрувати по ціні</Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Діапазон ціни: {filters.priceRange[0]} - {filters.priceRange[1]} грн
                </Typography>
                <Box px={"10px"}>
                    <Slider
                        value={filters.priceRange}
                        onChange={(event, newValue: [number, number]) =>
                            handleFilterChange("priceRange", newValue)
                        }
                        valueLabelDisplay="auto"
                        min={0}
                        max={priceMax} // Максимальна ціна
                        step={10} // Крок
                    />
                </Box>

                {/* Результати фільтрації */}
                <Typography>Знайдено {filterArrayLength}</Typography>
                <Button
                    variant="contained"
                    onClick={resetFilters}
                    disabled={!isFiltersChanged} // Деактивуємо кнопку, якщо фільтри не змінені
                >
                    Очистити
                </Button>
            </Grid>
        </Grid>
    );
};

export default Filters;
