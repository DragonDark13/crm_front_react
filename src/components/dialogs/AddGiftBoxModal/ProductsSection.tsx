import {Autocomplete, Button, DialogContent, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import QuantityField from "../../FormComponents/QuantityField";

const ProductsSection = ({
                             showSelectProduct,
                             setShowSelectProduct,
                             products,
                             selectedProducts,
                             handleProductSelect,
                             handleQuantityChange,
                             handleRemoveProduct
                         }) => (
    <>
        <Typography variant="body1" sx={{mt: 2}}>Товари</Typography>
        <Divider sx={{my: 1}}/>
        <div>
            {!showSelectProduct ? (
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AddIcon/>}
                    onClick={() => setShowSelectProduct(true)} // Show select when button is clicked
                >
                    Add Product
                </Button>
            ) : (
                <Grid container>
                    <Grid item xs={9}>
                        <Autocomplete

                            onChange={handleProductSelect}
                            options={products.filter((product) => {
                                const selected = selectedProducts.find((item) => item.product.id === product.id);
                                return (
                                    product.available_quantity > 0 &&
                                    (!selected || product.available_quantity > selected.quantity)
                                );
                            })}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => <TextField {...params} label="Select a Product"/>}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            disableClearable
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.name} ({option.available_quantity} шт)
                                </li>
                            )}
                        />
                    </Grid>
                    <Grid>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setShowSelectProduct(false)} // Сховуємо селектор
                        >
                            Закрити
                        </Button>
                    </Grid>
                </Grid>
            )}

            <div style={{marginTop: 10}}>
                {selectedProducts.map((item) => {

                    const product = item.product;
                    const availableQuantity = product.available_quantity;
                    const costPerItem = product.purchase_price_per_item;
                    const totalCost = item.quantity * costPerItem;

                    return (
                        <Grid container marginBottom={4} key={item.product.id} spacing={1} alignItems="center">
                            <Grid item xs={12}>
                                <Typography variant={"body2"}>
                                    {item.product.name}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <QuantityField
margin={"dense"} margin={"dense"}
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value), "product")}
                                    onIncrement={() => handleQuantityChange(product.id, item.quantity + 1, "product")}
                                    onDecrement={() => handleQuantityChange(product.id, item.quantity - 1, "product")}
                                    error={item.quantity > product.available_quantity ? "Перевищено доступну кількість" : ""}
                                />

                            </Grid>
                            {/*кількість<Grid item xs={3}>*/}
                            {/*    <TextField*/}
                            {/*        label={`Quantity`}*/}
                            {/*        value={item.quantity}*/}
                            {/*        onChange={(e) =>*/}
                            {/*            handleQuantityChange(*/}
                            {/*                product.id,*/}
                            {/*                Number(e.target.value),*/}
                            {/*                'product'*/}
                            {/*            )*/}
                            {/*        }*/}
                            {/*        type="number"*/}
                            {/*        fullWidth*/}
                            {/*        helperText={`Available: ${availableQuantity} pcs`}*/}
                            {/*        inputProps={{*/}
                            {/*            min: 1,*/}
                            {/*            max: availableQuantity,  // Обмеження на кількість*/}
                            {/*        }}*/}
                            {/*    />*/}
                            {/*    <div style={{marginTop: 5}}>*/}
                            {/*        <small>*/}
                            {/*            Available: {availableQuantity} pcs*/}
                            {/*        </small>*/}
                            {/*    </div>*/}
                            {/*</Grid>*/}
                            {/*<Grid item xs={3}>F*/}
                            {/*    <IconButton*/}
                            {/*        color="primary"*/}
                            {/*        onClick={() =>*/}
                            {/*            handleQuantityChange(product.id, item.quantity + 1, "product")*/}
                            {/*        }*/}
                            {/*        disabled={item.quantity >= availableQuantity}*/}
                            {/*    >*/}
                            {/*        <AddIcon/>*/}
                            {/*    </IconButton>*/}
                            {/*    <IconButton*/}
                            {/*        color="secondary"*/}
                            {/*        onClick={() =>*/}
                            {/*            item.quantity > 1*/}
                            {/*                ? handleQuantityChange(product.id, item.quantity - 1, "product")*/}
                            {/*                : null*/}
                            {/*        }*/}
                            {/*    >*/}
                            {/*        <RemoveIcon/>*/}
                            {/*    </IconButton>*/}
                            {/*    <Button*/}
                            {/*        color="error"*/}
                            {/*        onClick={() => handleRemoveProduct(product.id)}*/}
                            {/*    >*/}
                            {/*        Remove*/}
                            {/*    </Button>*/}
                            {/*</Grid>*/}
                            <Grid item xs={6}>
                                <div>
                                    <Typography
                                        variant={"subtitle2"}>
                                        <strong>Cost per item: </strong>
                                        {costPerItem} UAH
                                    </Typography>
                                </div>
                                <div>
                                    <Typography
                                        variant={"subtitle2"}>
                                        <strong>Total cost: </strong>
                                        {totalCost.toFixed(2)} UAH
                                    </Typography>
                                </div>
                            </Grid>
                        </Grid>
                    );
                })}
            </div>
        </div>

        {/* Логіка відображення товарів */}
        {/* Код секції з вибором продуктів */}
    </>
);

export default ProductsSection;