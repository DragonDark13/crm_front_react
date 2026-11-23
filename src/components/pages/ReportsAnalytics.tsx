import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {fetchAnalyticsOverview} from "../../api/_statisticsApi";
import {getApiErrorMessage} from "../../api/api";
import {
    AnalyticsOverviewResponse,
    AnalyticsRestockItem,
} from "../../api/contracts";

const formatDateInput = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const today = new Date();
const initialEndDate = formatDateInput(today);
const initialStartDate = formatDateInput(new Date(today.getFullYear(), today.getMonth(), 1));

const formatCurrency = (value: number) => new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 2,
}).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
}).format(value);

const formatMonth = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("uk-UA", {
        month: "short",
        year: "2-digit",
    });
};

const SummaryCard: React.FC<{
    title: string;
    value: string;
    description: string;
}> = ({title, value, description}) => (
    <Card elevation={0} sx={{height: "100%", border: "1px solid #e7eaf0", borderRadius: 2}}>
        <CardContent>
            <Typography color="text.secondary" variant="body2" gutterBottom>{title}</Typography>
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
            <Typography color="text.secondary" variant="caption">{description}</Typography>
        </CardContent>
    </Card>
);

const RestockStatus: React.FC<{item: AnalyticsRestockItem}> = ({item}) => (
    <Chip
        size="small"
        color={item.available_quantity === 0 ? "error" : "warning"}
        label={item.available_quantity === 0 ? "Немає в наявності" : "Потрібне поповнення"}
    />
);

const ReportsAnalytics: React.FC = () => {
    const [draftStartDate, setDraftStartDate] = useState(initialStartDate);
    const [draftEndDate, setDraftEndDate] = useState(initialEndDate);
    const [period, setPeriod] = useState({startDate: initialStartDate, endDate: initialEndDate});
    const [data, setData] = useState<AnalyticsOverviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");

        fetchAnalyticsOverview(period.startDate, period.endDate, controller.signal)
            .then(result => {
                if (!controller.signal.aborted) setData(result);
            })
            .catch(reason => {
                if (!controller.signal.aborted) {
                    setError(getApiErrorMessage(reason, "Не вдалося завантажити аналітику"));
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [period]);

    const applyPeriod = () => {
        if (draftStartDate && draftEndDate && draftStartDate <= draftEndDate) {
            setPeriod({startDate: draftStartDate, endDate: draftEndDate});
        }
    };

    const summary = data?.summary;
    const monthly = data?.monthly ?? [];
    const topProducts = data?.top_products ?? [];
    const restock = data?.restock ?? [];

    return (
        <Box sx={{width: "100%", minWidth: 0}}>
            <Typography className="crm-page-title" component="h1" variant="h4" gutterBottom>
                Аналітика та звіти
            </Typography>
            <Typography className="crm-page-description" color="text.secondary">
                Продажі, прибутковість товарів і потреба в поповненні запасів
            </Typography>

            <Paper elevation={0} sx={{p: 2, mb: 3, border: "1px solid #e7eaf0", borderRadius: 2}}>
                <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems={{sm: "center"}}>
                    <TextField
                        label="Початок періоду"
                        type="date"
                        size="small"
                        value={draftStartDate}
                        onChange={event => setDraftStartDate(event.target.value)}
                        InputLabelProps={{shrink: true}}
                        sx={{minWidth: {sm: 190}}}
                    />
                    <TextField
                        label="Кінець періоду"
                        type="date"
                        size="small"
                        value={draftEndDate}
                        onChange={event => setDraftEndDate(event.target.value)}
                        InputLabelProps={{shrink: true}}
                        sx={{minWidth: {sm: 190}}}
                    />
                    <Button
                        variant="contained"
                        onClick={applyPeriod}
                        disabled={!draftStartDate || !draftEndDate || draftStartDate > draftEndDate || loading}
                    >
                        Показати
                    </Button>
                    {draftStartDate > draftEndDate && (
                        <Typography color="error" variant="caption">
                            Початок періоду має бути раніше кінця
                        </Typography>
                    )}
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{mb: 3}}>{error}</Alert>}

            {loading && (
                <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && data && summary && (
                <>
                    <Grid container spacing={2} sx={{mb: 3}}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SummaryCard
                                title="Чиста виручка"
                                value={formatCurrency(summary.net_sales)}
                                description={`Виручка ${formatCurrency(summary.gross_sales)} мінус повернення`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SummaryCard
                                title="Валовий прибуток товарів"
                                value={formatCurrency(summary.product_gross_profit)}
                                description="Після собівартості та повернень"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SummaryCard
                                title="Повернення"
                                value={formatCurrency(summary.returns)}
                                description={`Повернуто одиниць: ${formatNumber(summary.returned_quantity)}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <SummaryCard
                                title="Грошові витрати"
                                value={formatCurrency(summary.total_expenses)}
                                description="Закупівлі товарів, пакування та інші витрати"
                            />
                        </Grid>
                    </Grid>

                    <Alert severity="info" sx={{mb: 3}}>
                        {data.profit_scope_note}
                    </Alert>

                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={7}>
                            <Paper elevation={0} sx={{p: 2, height: "100%", border: "1px solid #e7eaf0", borderRadius: 2}}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Продажі та прибуток за місяцями
                                </Typography>
                                {monthly.length ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={monthly} margin={{top: 12, right: 12, left: 8, bottom: 4}}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tickFormatter={formatMonth} />
                                            <YAxis />
                                            <Tooltip
                                                labelFormatter={value => formatMonth(String(value))}
                                                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                                            />
                                            <Bar dataKey="net_sales" name="Чиста виручка" fill="#1976d2" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="product_gross_profit" name="Валовий прибуток товарів" fill="#2e7d32" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography color="text.secondary" py={6} textAlign="center">
                                        За вибраний період продажів немає
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={5}>
                            <Paper elevation={0} sx={{p: 2, height: "100%", border: "1px solid #e7eaf0", borderRadius: 2}}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Популярні товари
                                </Typography>
                                {topProducts.length ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Товар</TableCell>
                                                    <TableCell align="right">Продано</TableCell>
                                                    <TableCell align="right">Повернуто</TableCell>
                                                    <TableCell align="right">Чисто</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {topProducts.map(item => (
                                                    <TableRow key={item.product_id}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell align="right">{formatNumber(item.sold_quantity)}</TableCell>
                                                        <TableCell align="right">{formatNumber(item.returned_quantity)}</TableCell>
                                                        <TableCell align="right" sx={{fontWeight: 700}}>{formatNumber(item.net_quantity)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography color="text.secondary" py={6} textAlign="center">
                                        Немає даних про продажі товарів
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            <Paper elevation={0} sx={{p: 2, border: "1px solid #e7eaf0", borderRadius: 2}}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Витрати за періодом
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Закупівлі товарів і пакування</TableCell>
                                                <TableCell align="right">{formatCurrency(summary.purchase_expenses)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell>Інші витрати</TableCell>
                                                <TableCell align="right">{formatCurrency(summary.other_expenses)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{fontWeight: 700}}>Разом</TableCell>
                                                <TableCell align="right" sx={{fontWeight: 700}}>{formatCurrency(summary.total_expenses)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Typography color="text.secondary" variant="caption" display="block" sx={{mt: 1}}>
                                    Закупівлі показані як рух коштів, а не як собівартість проданих товарів.
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            <Paper elevation={0} sx={{p: 2, border: "1px solid #e7eaf0", borderRadius: 2}}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6" fontWeight={700}>Потрібне поповнення</Typography>
                                    <Chip label={`${summary.restock_count} позицій`} color={summary.restock_count ? "warning" : "success"} size="small" />
                                </Stack>
                                {restock.length ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Позиція</TableCell>
                                                    <TableCell>Тип</TableCell>
                                                    <TableCell align="right">Залишок</TableCell>
                                                    <TableCell>Стан</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {restock.map(item => (
                                                    <TableRow key={`${item.type}-${item.id}`}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell>{item.type === "product" ? "Товар" : "Пакування"}</TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(item.available_quantity)} {item.unit}
                                                        </TableCell>
                                                        <TableCell><RestockStatus item={item} /></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography color="text.secondary" py={4} textAlign="center">
                                        Усі позиції вище мінімального залишку
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default ReportsAnalytics;
