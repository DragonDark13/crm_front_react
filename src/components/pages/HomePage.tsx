import React, {useMemo} from "react";
import {Alert, Box, Button, Chip, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {AddBox, Inventory2, LocalShipping, ShoppingCart, WarningAmber} from "@mui/icons-material";
import {Link} from "react-router-dom";
import {useProducts} from "../Provider/ProductContext";
import {IProduct} from "../../utils/types";

const LOW_STOCK_LIMIT = 5;
const formatNumber = (value: number) => new Intl.NumberFormat("uk-UA").format(value);

const StatCard: React.FC<{title: string; value: string; description: string; icon: React.ReactNode; accent?: string}> = ({title, value, description, icon, accent = "#1976d2"}) => (
    <Paper elevation={0} sx={{p: 2.5, height: "100%", border: "1px solid #e7eaf0", borderRadius: 2, display: "flex", justifyContent: "space-between", gap: 2}}>
        <Box>
            <Typography color="text.secondary" variant="body2">{title}</Typography>
            <Typography variant="h4" fontWeight={700} sx={{my: 1}}>{value}</Typography>
            <Typography color="text.secondary" variant="caption">{description}</Typography>
        </Box>
        <Box sx={{width: 44, height: 44, flexShrink: 0, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", color: accent, backgroundColor: accent + "14"}}>
            {icon}
        </Box>
    </Paper>
);

const getSupplierName = (product: IProduct) => product.supplier?.name || "Не вказано";

export default function HomePage() {
    const {products, loadingState, fetchProductsFunc} = useProducts();
    const inventory = useMemo(() => {
        const availableUnits = products.reduce((sum, product) => sum + product.available_quantity, 0);
        const reservedUnits = products.reduce((sum, product) => sum + (product.reserved_quantity || 0), 0);
        const lowStockProducts = products.filter(product => product.available_quantity < LOW_STOCK_LIMIT).sort((a, b) => a.available_quantity - b.available_quantity);
        return {availableUnits, reservedUnits, lowStockProducts, outOfStockCount: lowStockProducts.filter(product => product.available_quantity <= 0).length};
    }, [products]);

    return (
        <Box className="crm-page" sx={{display: "flex", flexDirection: "column", gap: 3}}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: {xs: "flex-start", sm: "center"}, flexWrap: "wrap", gap: 2}}>
                <Box>
                    <Typography className="crm-page-title" component="h1" variant="h4" fontWeight={700} gutterBottom>Огляд складу</Typography>
                    <Typography className="crm-page-description" color="text.secondary">Стан товарних запасів та операційні показники магазину</Typography>
                </Box>
                <Button variant="outlined" onClick={() => void fetchProductsFunc()} disabled={loadingState.isLoading}>Оновити дані</Button>
            </Box>

            {loadingState.error && (
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void fetchProductsFunc()}>Повторити</Button>}>
                    Не вдалося завантажити залишки товарів. {loadingState.error}
                </Alert>
            )}

            {loadingState.isLoading && products.length === 0 ? (
                <Box sx={{display: "flex", justifyContent: "center", py: 8}}><CircularProgress/></Box>
            ) : (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} xl={3}><StatCard title="Номенклатура" value={formatNumber(products.length)} description="Усього товарних позицій" icon={<Inventory2/>}/></Grid>
                        <Grid item xs={12} sm={6} xl={3}><StatCard title="Доступно на складі" value={formatNumber(inventory.availableUnits)} description="Одиниць, доступних для продажу" icon={<Inventory2/>} accent="#2e7d32"/></Grid>
                        <Grid item xs={12} sm={6} xl={3}><StatCard title="Зарезервовано" value={formatNumber(inventory.reservedUnits)} description="Одиниць у резерві" icon={<ShoppingCart/>} accent="#ed6c02"/></Grid>
                        <Grid item xs={12} sm={6} xl={3}><StatCard title="Потрібне поповнення" value={formatNumber(inventory.lowStockProducts.length)} description={"З них відсутні: " + inventory.outOfStockCount} icon={<WarningAmber/>} accent="#d32f2f"/></Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={12} lg={8}>
                            <Paper elevation={0} sx={{border: "1px solid #e7eaf0", borderRadius: 2, overflow: "hidden"}}>
                                <Box sx={{p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2}}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>Контроль залишків</Typography>
                                        <Typography variant="body2" color="text.secondary">Товари, для яких доступний залишок менший за {LOW_STOCK_LIMIT} одиниць</Typography>
                                    </Box>
                                    <Chip color={inventory.lowStockProducts.length > 0 ? "warning" : "success"} label={inventory.lowStockProducts.length + " позицій"}/>
                                </Box>
                                {inventory.lowStockProducts.length > 0 ? (
                                    <Table size="small">
                                        <TableHead><TableRow><TableCell>Товар</TableCell><TableCell>Постачальник</TableCell><TableCell align="right">Доступно</TableCell><TableCell align="right">Усього</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {inventory.lowStockProducts.slice(0, 8).map(product => (
                                                <TableRow key={product.id} hover>
                                                    <TableCell>
                                                        <Typography fontWeight={600} variant="body2">{product.name}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{product.article || ("ID: " + product.id)}</Typography>
                                                    </TableCell>
                                                    <TableCell>{getSupplierName(product)}</TableCell>
                                                    <TableCell align="right"><Chip size="small" color={product.available_quantity <= 0 ? "error" : "warning"} label={formatNumber(product.available_quantity)}/></TableCell>
                                                    <TableCell align="right">{formatNumber(product.total_quantity)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Box sx={{px: 2.5, pb: 2.5}}><Alert severity="success">Немає товарів із критично малим залишком.</Alert></Box>
                                )}
                                {inventory.lowStockProducts.length > 8 && <Box sx={{p: 2, borderTop: "1px solid #e7eaf0"}}><Typography variant="body2" color="text.secondary">Ще {inventory.lowStockProducts.length - 8} позицій потребують уваги.</Typography></Box>}
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Paper elevation={0} sx={{p: 2.5, border: "1px solid #e7eaf0", borderRadius: 2, height: "100%"}}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Швидкий перехід</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Обери товар у каталозі, щоб оформити продаж або закупівлю</Typography>
                                <Box sx={{display: "flex", flexDirection: "column", gap: 1.25}}>
                                    <Button component={Link} to="/crm_front_react/products" variant="contained" startIcon={<Inventory2/>} fullWidth>Знайти товар · продаж або закупівля</Button>
                                    <Button component={Link} to="/crm_front_react/sales" variant="outlined" startIcon={<ShoppingCart/>} fullWidth>Історія продажів</Button>
                                    <Button component={Link} to="/crm_front_react/purchases" variant="outlined" startIcon={<AddBox/>} fullWidth>Історія закупівель</Button>
                                    <Button component={Link} to="/crm_front_react/suppliers" variant="outlined" startIcon={<LocalShipping/>} fullWidth>Постачальники</Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
}
