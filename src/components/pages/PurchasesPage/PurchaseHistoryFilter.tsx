import React from 'react';
import {
    Box,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    TextField,
    Typography
} from "@mui/material";
import { ICategory } from "../../../utils/types";

interface PurchaseHistoryFilterProps {
    filter: string;
    handleFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    dateRangeFilter: { start: string; end: string };
    handleDateRangeFilterChange: (key: 'start' | 'end', value: string) => void;
    categoryFilter: string;
    handleCategoryFilterChange: (e: any) => void;
    categories: ICategory[];
    supplierFilter: string;
    handleSupplierFilterChange: (e: any) => void;
    purchaseHistory: { supplier_name: string }[];
    typeFilter: string;
    handleTypeFilterChange: (e: any) => void;
    priceBounds: number[];
    priceRangeFilterSlider: number[];
    setPriceRangeFilterSlider: (value: number[]) => void;
}

const PurchaseHistoryFilter: React.FC<PurchaseHistoryFilterProps> = ({
    filter,
    handleFilterChange,
    dateRangeFilter,
    handleDateRangeFilterChange,
    categoryFilter,
    handleCategoryFilterChange,
    categories,
    supplierFilter,
    handleSupplierFilterChange,
    purchaseHistory,
    typeFilter,
    handleTypeFilterChange,
    priceBounds,
    priceRangeFilterSlider,
    setPriceRangeFilterSlider
}) => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={6} md={5}>
                <TextField
                    placeholder={'Назва'}
                    size="small"
                    margin="dense"
                    label="Пошук"
                    variant="outlined"
                    fullWidth
                    value={filter}
                    onChange={handleFilterChange}
                />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
                <TextField
                    size="small"
                    margin="dense"
                    label="Дата початку"
                    type="date"
                    fullWidth
                    value={dateRangeFilter.start}
                    onChange={(e) => handleDateRangeFilterChange('start', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
                <TextField
                    size="small"
                    margin="dense"
                    label="Дата закінчення"
                    type="date"
                    fullWidth
                    value={dateRangeFilter.end}
                    onChange={(e) => handleDateRangeFilterChange('end', e.target.value)}
                    inputProps={{ min: dateRangeFilter.start || undefined }}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth margin="dense">
                    <InputLabel>Категорія</InputLabel>
                    <Select label="Категорія" value={categoryFilter} onChange={handleCategoryFilterChange}>
                        <MenuItem value="">Всі категорії</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth margin="dense">
                    <InputLabel>Постачальник</InputLabel>
                    <Select label="Постачальник" value={supplierFilter} onChange={handleSupplierFilterChange}>
                        <MenuItem value="">Всі постачальники</MenuItem>
                        {Array.from(new Set(purchaseHistory.map((item) => item.supplier_name))).map(
                            (supplier, index) => (
                                <MenuItem key={supplier + index} value={supplier}>{supplier}</MenuItem>
                            )
                        )}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
                <FormControl size="small" fullWidth margin="dense">
                    <InputLabel>Тип</InputLabel>
                    <Select label="Тип" value={typeFilter} onChange={handleTypeFilterChange}>
                        <MenuItem value="">Всі типи</MenuItem>
                        <MenuItem value="Other Investment">Інші інвестиції</MenuItem>
                        <MenuItem value="Packaging">Упаковка</MenuItem>
                        <MenuItem value="Product">Продукт</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={12} md={5}>
                <Typography variant="caption">Діапазон ціни (за од.):</Typography>
                <Box px={2}>
                    {Number.isFinite(priceBounds[0]) && Number.isFinite(priceBounds[1]) && (
                        <Slider
                            value={priceRangeFilterSlider}
                            onChange={(_, newValue) => setPriceRangeFilterSlider(newValue as number[])}
                            valueLabelDisplay="auto"
                            min={priceBounds[0]}
                            max={priceBounds[1]}
                            marks={[
                                { value: priceBounds[0], label: `${priceBounds[0]}₴` },
                                { value: priceBounds[1], label: `${priceBounds[1]}₴` }
                            ]}
                        />
                    )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default PurchaseHistoryFilter;
