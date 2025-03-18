import {Autocomplete, Button, DialogContent, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React from "react";
import QuantityField from "../FormComponents/QuantityField";

const PackagingSection = ({
                              showSelectPackaging,
                              setShowSelectPackaging,
                              packagingMaterials,
                              selectedPackaging,
                              handlePackagingSelect,
                              handleQuantityChange,
                              handleRemoveMaterial
                          }) => (
    <>
        <Typography variant="body1" sx={{mt: 2}}>Пакування</Typography>
        <Divider sx={{my: 1}}/>
        <div>
            {!showSelectPackaging ? (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={() => setShowSelectPackaging(true)}
                >
                    Add Packaging
                </Button>
            ) : (
                <Grid container>
                    <Grid item xs={9}>
                        <Autocomplete
                            onChange={handlePackagingSelect}
                            options={packagingMaterials.filter((material) => {
                                const selected = selectedPackaging.find((item) => item.material.id === material.id);
                                return (
                                    material.available_quantity > 0 &&
                                    (!selected || material.available_quantity > selected.quantity)
                                );
                            })}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => <TextField {...params} label="Select Packaging"/>}
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
                            onClick={() => setShowSelectPackaging(false)}
                        >
                            Закрити
                        </Button>


                    </Grid>
                </Grid>
            )}

            {/* Відображення обраного пакування */}
            <div style={{marginTop: 10}}>
                {selectedPackaging.map((item) => {

                    const material = item.material;
                    const availableQuantity = material.available_quantity;
                    const costPerItem = material.purchase_price_per_unit;
                    const totalCost = item.quantity * costPerItem;

                    return (
                        <Grid container marginBottom={4} key={item.material.id} spacing={1} alignItems="center">
                            <Grid item xs={12}>
                                <Typography variant={"body2"}>
                                    {item.material.name}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <QuantityField
                                    margin={"dense"}
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(material.id, Number(e.target.value), "packaging")}
                                    onIncrement={() => handleQuantityChange(material.id, item.quantity + 1, "packaging")}
                                    onDecrement={() => handleQuantityChange(material.id, item.quantity - 1, "packaging")}
                                    error={item.quantity > material.available_quantity ? "Перевищено доступну кількість" : ""}
                                />
                            </Grid>
                            {/*<Grid item xs={3}>*/}
                            {/*    <TextField*/}
                            {/*        label={`Quantity`}*/}
                            {/*        value={item.quantity}*/}
                            {/*        onChange={(e) =>*/}
                            {/*            handleQuantityChange(*/}
                            {/*                material.id,*/}
                            {/*                Number(e.target.value),*/}
                            {/*                'packaging'*/}
                            {/*            )*/}
                            {/*        }*/}
                            {/*        type="number"*/}
                            {/*        fullWidth*/}
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
                            {/*<Grid item xs={3}>*/}
                            {/*    <IconButton*/}
                            {/*        color="primary"*/}
                            {/*        onClick={() =>*/}
                            {/*            handleQuantityChange(material.id, item.quantity + 1, "packaging")*/}
                            {/*        }*/}
                            {/*        disabled={item.quantity >= availableQuantity}*/}
                            {/*    >*/}
                            {/*        <AddIcon/>*/}
                            {/*    </IconButton>*/}
                            {/*    <IconButton*/}
                            {/*        color="secondary"*/}
                            {/*        onClick={() =>*/}
                            {/*            item.quantity > 1*/}
                            {/*                ? handleQuantityChange(material.id, item.quantity - 1, "packaging")*/}
                            {/*                : null*/}
                            {/*        }*/}
                            {/*    >*/}
                            {/*        <RemoveIcon/>*/}
                            {/*    </IconButton>*/}
                            {/*    <Button*/}
                            {/*        color="error"*/}
                            {/*        onClick={() => handleRemoveMaterial(material.id)}*/}
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

    </>
);

export default PackagingSection;