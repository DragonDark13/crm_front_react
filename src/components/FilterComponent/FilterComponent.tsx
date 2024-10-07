import {Button, Grid, Slider, Typography} from "@mui/material";
import CategoryFilter from "../CategoryFilter/CategoryFilter";
import SupplierFilter from "../SupplierFilter/SupplierFilter";
import {ICategory, ISupplier} from "../../utils/types";
import {ChangeEvent} from "react";

//TODO фільтр по ціні

interface IFilterComponentProps {
    selectedFilterCategories: number[];
    handleCategoryFilterChange: (categoryID: number) => void;
    categories: ICategory[]; // TODO: create type interface

    selectedFilterSuppliers: number[];
    handleSupplierFilterChange: (supplierID: number) => void;
    suppliers: ISupplier[]; // TODO: create type interface
    resetFilters: () => void;
    priceRange: number[];
    handlePriceRangeChange: (event: ChangeEvent<unknown>, newValue: number[]) => void;
    priceMax: number
    filterArrayLength: number;

}

const FilterComponent = ({

                             handleCategoryFilterChange,
                             categories,
                             handleSupplierFilterChange,
                             selectedFilterCategories,
                             selectedFilterSuppliers,
                             suppliers,
                             resetFilters,
                             handlePriceRangeChange,
                             priceRange,
                             priceMax,
                             filterArrayLength
                         }: IFilterComponentProps) => {
    return (
        <Grid container px={2} >
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

                    <Typography gutterBottom>Фільтрувати по ціні</Typography>

                    <Typography variant="subtitle1" gutterBottom>
  Діапазон ціни: {priceRange[0]} - {priceRange[1]} грн
</Typography>
                    <Slider
                        value={priceRange}
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
