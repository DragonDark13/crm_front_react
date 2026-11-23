import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {fetchSalesHistory} from "../../api/_salesApi";
import {createCustomerReturn, fetchCustomerReturns} from "../../api/_returns";
import {getApiErrorMessage} from "../../api/api";
import {CustomerReturn} from "../../api/contracts";


interface ReturnableSale {
    sale_id: number;
    product_name: string;
    customer: {id: number; name: string};
    quantity_sold: number;
    total_price: string;
    sale_date: string;
    type: string;
}

const formatAmount = (amount: number) => new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
}).format(amount);

const formatDate = (value: string | null) => {
    if (!value) return "—";
    const date = value.slice(0, 10).split("-");
    return date.length === 3 ? `${date[2]}.${date[1]}.${date[0]}` : value;
};

const CustomerReturnsPage: React.FC = () => {
    const [returns, setReturns] = useState<CustomerReturn[]>([]);
    const [sales, setSales] = useState<ReturnableSale[]>([]);
    const [saleId, setSaleId] = useState<number | "">("");
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [returnData, salesData] = await Promise.all([
                fetchCustomerReturns(),
                fetchSalesHistory<ReturnableSale[]>(),
            ]);
            setReturns(returnData);
            setSales(salesData.filter(sale => sale.type !== "gift_set" && Number.isInteger(sale.sale_id)));
        } catch {
            setError("Не вдалося завантажити дані повернень.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const returnedBySale = useMemo(() => returns.reduce<Record<number, number>>((result, item) => {
        if (item.sale_id !== null) {
            result[item.sale_id] = (result[item.sale_id] || 0) + item.quantity_returned;
        }
        return result;
    }, {}), [returns]);

    const returnableSales = useMemo(() => sales.filter(
        sale => sale.quantity_sold - (returnedBySale[sale.sale_id] || 0) > 0
    ), [sales, returnedBySale]);

    const selectedSale = returnableSales.find(sale => sale.sale_id === saleId);
    const remainingQuantity = selectedSale
        ? selectedSale.quantity_sold - (returnedBySale[selectedSale.sale_id] || 0)
        : 0;
    const alreadyRefundedAmount = selectedSale
        ? returns.filter(item => item.sale_id === selectedSale.sale_id)
            .reduce((total, item) => total + item.return_amount, 0)
        : 0;
    const estimatedRefund = selectedSale && remainingQuantity > 0
        ? (Number(selectedSale.total_price) - alreadyRefundedAmount) * quantity / remainingQuantity
        : 0;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedSale || quantity < 1 || quantity > remainingQuantity) return;

        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const result = await createCustomerReturn(selectedSale.sale_id, {quantity, reason});
            setSuccess(`Повернення №${result.return.id} зареєстровано. Сума: ${formatAmount(result.return.return_amount)}.`);
            setSaleId("");
            setQuantity(1);
            setReason("");
            await loadData();
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Не вдалося зареєструвати повернення."));
        } finally {
            setSubmitting(false);
        }
    };

    const totalRefunded = returns.reduce((total, item) => total + item.return_amount, 0);

    return (
        <div>
            <Typography className="crm-page-title" variant="h5" component="h1" gutterBottom>
                Контроль повернень
            </Typography>
            <Typography className="crm-page-description" color="text.secondary" sx={{mb: 2}}>
                Реєстрація повернень товарів за початковим продажем. Початкові записи продажів не видаляються.
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

            <Paper component="form" onSubmit={handleSubmit} sx={{p: 2, mb: 3}}>
                <Typography variant="h6" gutterBottom>Зареєструвати повернення</Typography>
                <TextField
                    select
                    fullWidth
                    size="small"
                    label="Продаж"
                    value={saleId}
                    onChange={event => {
                        setSaleId(event.target.value === "" ? "" : Number(event.target.value));
                        setQuantity(1);
                    }}
                    sx={{mb: 2}}
                >
                    {returnableSales.map(sale => (
                        <MenuItem key={sale.sale_id} value={sale.sale_id}>
                            {sale.product_name} — {sale.customer.name} — {formatDate(sale.sale_date)} — залишок до повернення: {sale.quantity_sold - (returnedBySale[sale.sale_id] || 0)}
                        </MenuItem>
                    ))}
                </TextField>
                {selectedSale && (
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        Початковий продаж: {selectedSale.quantity_sold} шт. · Уже повернуто: {returnedBySale[selectedSale.sale_id] || 0} шт. · Доступно: {remainingQuantity} шт.
                    </Typography>
                )}
                <div style={{display: "flex", gap: 16, flexWrap: "wrap"}}>
                    <TextField
                        type="number"
                        size="small"
                        label="Кількість"
                        value={quantity}
                        onChange={event => setQuantity(Math.max(1, Number(event.target.value)))}
                        inputProps={{min: 1, max: remainingQuantity, step: 1}}
                        disabled={!selectedSale}
                    />
                    <TextField
                        size="small"
                        label="Причина повернення"
                        value={reason}
                        onChange={event => setReason(event.target.value)}
                        sx={{flex: 1, minWidth: 220}}
                    />
                    <Button type="submit" variant="contained" disabled={!selectedSale || submitting || quantity > remainingQuantity}>
                        {submitting ? "Збереження..." : "Зареєструвати"}
                    </Button>
                </div>
                {selectedSale && (
                    <Typography variant="body2" sx={{mt: 1}}>
                        Орієнтовна сума повернення: {formatAmount(estimatedRefund)}
                    </Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block" sx={{mt: 1}}>
                    Сума остаточно розраховується сервером пропорційно фактичній сумі продажу. Повернення гіфтбоксів поки не підтримується.
                </Typography>
            </Paper>

            <div style={{display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16}}>
                <Paper sx={{p: 2, minWidth: 180}}>
                    <Typography variant="body2" color="text.secondary">Кількість повернень</Typography>
                    <Typography variant="h6">{returns.length}</Typography>
                </Paper>
                <Paper sx={{p: 2, minWidth: 180}}>
                    <Typography variant="body2" color="text.secondary">Повернуто коштів</Typography>
                    <Typography variant="h6">{formatAmount(totalRefunded)}</Typography>
                </Paper>
            </div>

            <Typography variant="h6" gutterBottom>Історія повернень</Typography>
            {loading ? (
                <div style={{display: "flex", justifyContent: "center", padding: 32}}>
                    <CircularProgress/>
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Дата</TableCell>
                                <TableCell>Товар</TableCell>
                                <TableCell>Клієнт</TableCell>
                                <TableCell align="right">Кількість</TableCell>
                                <TableCell align="right">Сума</TableCell>
                                <TableCell>Причина</TableCell>
                                <TableCell>Оформив</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {returns.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{formatDate(item.return_date)}</TableCell>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>{item.customer_name}</TableCell>
                                    <TableCell align="right">{item.quantity_returned}</TableCell>
                                    <TableCell align="right">{formatAmount(item.return_amount)}</TableCell>
                                    <TableCell>{item.return_reason || "—"}</TableCell>
                                    <TableCell>{item.returned_by_username || "—"}</TableCell>
                                </TableRow>
                            ))}
                            {returns.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">Повернень поки немає</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default CustomerReturnsPage;
