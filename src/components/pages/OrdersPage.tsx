import React, {useCallback, useEffect, useState} from "react";
import {
    Alert, Box, Card, CardContent, Chip, Divider, FormControl, InputLabel, MenuItem, Paper, Select,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from "@mui/material";
import {fetchOrders, updateOrderStatus} from "../../api/_ordersApi";
import {useSnackbarMessage} from "../Provider/SnackbarMessageContext";
import {getApiErrorMessage} from "../../api/api";
import type {OrderRecord, OrderStatus} from "../../api/contracts";

const statusLabels: Record<OrderStatus, string> = {
    new: "Нове",
    confirmed: "Підтверджене",
    awaiting_payment: "Очікує оплати",
    paid: "Оплачене",
    shipped: "Відправлене",
    completed: "Виконане",
    cancelled: "Скасоване"
};

const statusColors: Record<OrderStatus, "default" | "info" | "primary" | "warning" | "success" | "error"> = {
    new: "info",
    confirmed: "primary",
    awaiting_payment: "warning",
    paid: "success",
    shipped: "info",
    completed: "success",
    cancelled: "error"
};

const formatCurrency = (amount: number) =>
    amount.toLocaleString("uk-UA", {style: "currency", currency: "UAH"});

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const {showSnackbarMessage} = useSnackbarMessage();

    const loadOrders = useCallback(async () => {
        try {
            setError("");
            setOrders(await fetchOrders());
        } catch (requestError) {
            setError(getApiErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    const handleStatusChange = async (order: OrderRecord, status: OrderStatus) => {
        if (status === order.status) return;

        setUpdatingId(order.id);
        try {
            const response = await updateOrderStatus(order.id, status);
            setOrders(current => current.map(item => item.id === order.id ? response.order : item));
            showSnackbarMessage("Статус замовлення оновлено", "success");
        } catch (requestError) {
            showSnackbarMessage(getApiErrorMessage(requestError), "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const renderStatusSelect = (order: OrderRecord, view: "desktop" | "mobile") => (
        <FormControl size="small" fullWidth>
            <InputLabel id={`order-status-${view}-${order.id}`}>Статус замовлення</InputLabel>
            <Select
                labelId={`order-status-${view}-${order.id}`}
                label="Статус замовлення"
                value={order.status}
                disabled={updatingId === order.id || order.available_transitions.length === 0}
                onChange={event => void handleStatusChange(order, event.target.value as OrderStatus)}
            >
                <MenuItem value={order.status}>{statusLabels[order.status]} (поточний)</MenuItem>
                {order.available_transitions.map(status => (
                    <MenuItem key={status} value={status}>{statusLabels[status]}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    return (
        <div className="crm-page">
            <div className="crm-page-heading">
                <Typography className="crm-page-title" variant="h4" marginBlockEnd={1}>Замовлення</Typography>
                <Typography className="crm-page-description" marginBottom={3}>
                    Керування замовленнями інтернет-магазину та їхніми статусами
                </Typography>
            </div>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {loading ? (
                <Typography>Завантаження замовлень…</Typography>
            ) : orders.length === 0 ? (
                <Alert severity="info">Поки що немає замовлень</Alert>
            ) : (
                <>
                    <Box className="orders-desktop-table">
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Замовлення</TableCell>
                                        <TableCell>Покупець</TableCell>
                                        <TableCell>Дата</TableCell>
                                        <TableCell align="right">Сума</TableCell>
                                        <TableCell>Статус</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map(order => (
                                        <TableRow key={order.id} hover>
                                            <TableCell>
                                                <Typography fontWeight={600}>№{order.id}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.items.map(item => `${item.product_name} × ${item.quantity}`).join(", ")}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography>{order.customer_name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {order.customer_phone || order.customer_email || "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {order.created_at ? new Date(order.created_at).toLocaleString("uk-UA") : "—"}
                                            </TableCell>
                                            <TableCell align="right">{formatCurrency(order.total_amount)}</TableCell>
                                            <TableCell>{renderStatusSelect(order, "desktop")}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box className="orders-mobile-list">
                        <Stack spacing={1.5}>
                            {orders.map(order => (
                                <Card key={order.id} variant="outlined">
                                    <CardContent sx={{p: 2, "&:last-child": {pb: 2}}}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                                                <Box sx={{minWidth: 0}}>
                                                    <Typography variant="h6" component="h2">Замовлення №{order.id}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {order.created_at ? new Date(order.created_at).toLocaleString("uk-UA") : "Дата не вказана"}
                                                    </Typography>
                                                </Box>
                                                <Chip size="small" color={statusColors[order.status]} label={statusLabels[order.status]}/>
                                            </Stack>

                                            <Divider/>

                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700}>Покупець</Typography>
                                                <Typography>{order.customer_name}</Typography>
                                                {(order.customer_phone || order.customer_email) && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {order.customer_phone || order.customer_email}
                                                    </Typography>
                                                )}
                                                {order.delivery_address && (
                                                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5, overflowWrap: "anywhere"}}>
                                                        Доставка: {order.delivery_address}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{mb: 0.5}}>
                                                    Склад замовлення
                                                </Typography>
                                                <Stack spacing={0.75}>
                                                    {order.items.map(item => (
                                                        <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                                            <Box sx={{minWidth: 0, flex: 1}}>
                                                                <Typography variant="body2" sx={{overflowWrap: "anywhere"}}>
                                                                    {item.product_name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {item.article ? `Артикул: ${item.article} · ` : ""}{item.quantity} шт. × {formatCurrency(item.unit_price)}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight={600} sx={{whiteSpace: "nowrap"}}>
                                                                {formatCurrency(item.line_total)}
                                                            </Typography>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {order.notes && (
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={700}>Коментар</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{overflowWrap: "anywhere"}}>
                                                        {order.notes}
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Divider/>

                                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                                <Typography variant="body2" color="text.secondary">Сума замовлення</Typography>
                                                <Typography variant="h6" color="primary.main" fontWeight={700}>
                                                    {formatCurrency(order.total_amount)}
                                                </Typography>
                                            </Stack>

                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{mb: 0.75}}>
                                                    Змінити статус
                                                </Typography>
                                                {renderStatusSelect(order, "mobile")}
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                </>
            )}
            <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                    Після підтвердження товар резервується. Продаж і остаточне списання фіксуються лише після завершення замовлення.
                </Typography>
            </Box>
        </div>
    );
};

export default OrdersPage;
