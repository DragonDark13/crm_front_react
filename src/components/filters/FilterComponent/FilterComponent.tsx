import {Button, Grid, Slider, Typography} from "@mui/material";
import CategoryFilter from "../CategoryFilter/CategoryFilter";
import SupplierFilter from "../SupplierFilter/SupplierFilter";
import {ICategory, IProduct, IStateFilters, ISupplier} from "../../../utils/types";
import React, { useEffect, useState} from "react";


interface IFilterComponentProps {
    categories: ICategory[];
    suppliers: ISupplier[];
    resetFilters: () => void;
    filterArrayLength: number;
    products: IProduct[];
    setFilteredProducts: (filteredProducts: IProduct[]) => void;
    filters: IStateFilters;
    setFilters: React.Dispatch<React.SetStateAction<IStateFilters>>;
}

const FilterComponent = ({
                             categories,
                             suppliers,
                             resetFilters,
                             filterArrayLength,
                             products,
                             setFilteredProducts,
                             filters,
                             setFilters
                         }: IFilterComponentProps) => {

    const [priceMax, setPriceMax] = useState(0)

// Функція для застосування фільтрів
    const applyFilters = (callback?) => {
        let filtered = products;

        const {categories, suppliers, priceRange} = filters;

        // Фільтр за категоріями
        if (categories.length > 0) {
            filtered = filtered.filter(product =>
                product.category_ids.some(categoryId => categories.includes(categoryId))
            );
        }

        // Фільтр за постачальниками
        if (suppliers.length > 0) {
            filtered = filtered.filter(product => product.supplier && suppliers.includes(product.supplier.id));
        }

        // Фільтр за ціновим діапазоном
        filtered = filtered.filter(product =>
            product.selling_price_per_item >= priceRange[0] && product.selling_price_per_item <= priceRange[1]
        );

        setFilteredProducts(filtered); // Оновлюємо відфільтровані продукти
        if (callback) callback(); // Викликаємо callback, якщо він переданий
    };

    // Коли завантажуються продукти, обчислімо мінімальну і максимальну ціну
    useEffect(() => {
        if (products.length > 0) {
            const prices = products.map(product => product.selling_price_per_item);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
             // Update filters without specifying the type
            setFilters(prevState => ({
                ...prevState,
                priceRange: [minPrice, maxPrice],
            }));

            const max = Math.max(...products.map(product => product.selling_price_per_item))
            setPriceMax(max);

        }

    }, [products]);

// Загальний обробник змін фільтрів
    const handleFilterChange = (filterType: 'categories' | 'suppliers' | 'priceRange', newValue) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterType]: newValue,
        }));
    };

// Обробник зміни категорій
    const handleCategoryFilterChange = (categoryID: number) => {
        const updatedCategories = toggleFilter(filters.categories, categoryID);
        handleFilterChange('categories', updatedCategories);
    };

// Обробник зміни постачальників
    const handleSupplierFilterChange = (supplierID: number) => {
        const updatedSuppliers = toggleFilter(filters.suppliers, supplierID);
        handleFilterChange('suppliers', updatedSuppliers);
    };

// Обробник зміни діапазону цін
    const handlePriceRangeChange = (event, newValue: [number, number]) => {
        handleFilterChange('priceRange', newValue);
    };

// Функція для toggle категорій і постачальників
    const toggleFilter = (currentFilters: number[], id: number) => {
        return currentFilters.includes(id)
            ? currentFilters.filter(filterId => filterId !== id)
            : [...currentFilters, id];
    };

// Використовуємо useEffect, щоб автоматично застосовувати фільтри при зміні стейту
    useEffect(() => {
        applyFilters();
    }, [filters]);


    return (
        <Grid container px={2}>
            <Grid item xs={12}>
                <h2>Фільтри</h2>
                <div>
                    <div>
                        <h3>Категорії</h3>
                        <CategoryFilter
                            selectedFilterCategories={filters.categories}
                            handleCategoryFilterChange={handleCategoryFilterChange}
                            categories={categories}
                        />
                    </div>
                    <div>
                        <h3>Постачальники</h3>
                        <SupplierFilter
                            selectedFilterSuppliers={filters.suppliers}
                            handleSupplierFilterChange={handleSupplierFilterChange}
                            suppliers={suppliers}
                        />
                    </div>

                    <Typography gutterBottom>Фільтрувати по ціні</Typography>

                    <Typography variant="subtitle1" gutterBottom>
                        Діапазон ціни: {filters.priceRange[0]} - {filters.priceRange[1]} грн
                    </Typography>
                    <Slider
                        value={filters.priceRange}
                        onChange={handlePriceRangeChange}
                        valueLabelDisplay="auto"
                        min={0}
                        max={priceMax} // Максимальна ціна
                        step={10} // Крок
                    />

                </div>
                <Typography>

                    Знайдено {filterArrayLength}
                </Typography>
                <Button variant={"contained"} onClick={resetFilters}>
                    Очистити
                </Button>
            </Grid>

        </Grid>

    );
};

export default FilterComponent;
