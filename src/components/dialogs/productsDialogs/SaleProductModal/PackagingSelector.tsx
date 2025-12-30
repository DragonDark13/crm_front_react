import React from "react";
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Button, Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import QuantityField from "../../../FormComponents/QuantityField";
import TotalPriceField from "../../../FormComponents/TotalPriceField";
import {useTheme} from "@mui/material/styles";
import {IMaterial, ISaleData} from "../../../../utils/types.ts";
//TODO add possible adding multipole packaging

interface IPackagingSelector {
    saleData: ISaleData;
    setSaleData: (data: ISaleData) => void;
    packagingMaterials:IMaterial[];
    removePackage: () => void;
}

const PackagingSelector = ({
                               saleData,
                               setSaleData,
                               packagingMaterials,
                               removePackage
                           }:IPackagingSelector) => {
    const selectedPackaging = packagingMaterials.find(material => material.id === saleData.packaging_id);
    const maxQuantity = selectedPackaging?.available_quantity || 0;
    const unitCost = selectedPackaging?.purchase_price_per_unit || 0;

    const handlePackagingChange = (e: { target: { value: any; }; }) => {
        setSaleData({
            ...saleData,
            packaging_id: e.target.value,
            packaging_quantity: 1
        });
    };

    const handleQuantityIncrement = () => {
        if (saleData.packaging_quantity < maxQuantity) {
            setSaleData({
                ...saleData,
                packaging_quantity: saleData.packaging_quantity + 1
            });
        }
    };

    const handleQuantityDecrement = () => {
        if (saleData.packaging_quantity > 0) {
            setSaleData({
                ...saleData,
                packaging_quantity: saleData.packaging_quantity - 1
            });
        }
    };

    const handleQuantityChange = (e: { target: { value: string; }; }) => {
        let value = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
        if (/^\d+$/.test(value)) {
            setSaleData({
                ...saleData,
                packaging_quantity: Number(value)
            });
        }
    };
    const theme = useTheme();

    return (
        <Grid container spacing={1} alignItems="flex-start">
            <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth margin="normal">
                    <InputLabel className={'sale_form__packaging_field'}
                                id="packaging-select-label">Пакування</InputLabel>
                    <Select
                        size="small"
                        label="Пакування"
                        value={saleData.packaging_id || ''}
                        onChange={handlePackagingChange}
                        fullWidth
                    >
                        {packagingMaterials.map((material) => (
                            <MenuItem key={material.id} value={material.id}>
                                {material.name} (Доступно: {material.available_quantity})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                {saleData.packaging_id === '' ? (
                    <Typography variant="body2" color="error">
                        Спочатку оберіть пакування
                    </Typography>
                ) : (
                    <QuantityField
                        label="Кількість пакування"
                        readonly={saleData.packaging_id === ''}
                        onIncrement={handleQuantityIncrement}
                        onDecrement={handleQuantityDecrement}
                        value={saleData.packaging_quantity}
                        onChange={handleQuantityChange}
                        helperText={saleData.packaging_quantity > maxQuantity ? "Перевищено доступну кількість" : ""}
                        error={saleData.packaging_quantity > maxQuantity}
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <TotalPriceField label={"Собівартість за од"} value={Number(unitCost.toFixed(2))}/>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <TotalPriceField label={"Сумма"} value={Number((unitCost * saleData.packaging_quantity).toFixed(2))}/>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Button sx={{marginTop: '16px'}} variant="contained" endIcon={<DeleteIcon/>} onClick={removePackage}
                        color="error">
                    Видалити
                </Button>
            </Grid>

            <Grid item xs={12}>
                {/*<Typography>*/}
                {/*    Собівартість пакування за 1 одиницю: {unitCost.toFixed(2)} грн.*/}
                {/*</Typography>*/}
                <Typography>
                    Кількість у наявності: {maxQuantity}
                </Typography>
                                                                                <Divider   sx={{opacity:1,borderColor:theme.palette.grey[500],marginY:2}} />
            </Grid>
        </Grid>
    );
};

export default PackagingSelector;
