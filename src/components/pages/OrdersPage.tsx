import React, {useCallback, useEffect, useState} from "react";
import {
    Alert, Box, FormControl, InputLabel, MenuItem, Paper, Select,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
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
                                        <Typography variant="caption" color="text.secondary">{order.customer_phone || order.customer_email || "—"}</Typography>
                                    </TableCell>
                                    <TableCell>{order.created_at ? new Date(order.created_at).toLocaleString("uk-UA") : "—"}</TableCell>
                                    <TableCell align="right">{order.total_amount.toLocaleString("uk-UA", {style: "currency", currency: "UAH"})}</TableCell>
                                    <TableCell>
                                        <FormControl size="small" fullWidth>
                                            <InputLabel id={`order-status-${order.id}`}>Статус</InputLabel>
                                            <Select
                                                labelId={`order-status-${order.id}`}
                                                label="Статус"
                                                value={order.status}
                                                disabled={updatingId === order.id || order.available_transitions.length === 0}
                                                onChange={event => void handleStatusChange(order, event.target.value as OrderStatus)}
                                            >
                                                <MenuItem value={order.status}>{statusLabels[order.status]}</MenuItem>
                                                {order.available_transitions.map(status => (
                                                    <MenuItem key={status} value={status}>{statusLabels[status]}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
