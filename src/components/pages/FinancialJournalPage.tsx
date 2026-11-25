import React, {useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {
    AccountBalanceWalletOutlined,
    RefreshOutlined,
    TrendingDownOutlined,
    TrendingUpOutlined
} from "@mui/icons-material";
import {fetchResource, API_ENDPOINTS} from "../../api/api";
import RenderHeaderCell from "../_elements/RenderHeaderCell";

interface FinancialOperation {
    id: string;
    source_id: number;
    date: string | null;
    direction: "income" | "expense";
    type: string;
    description: string;
    counterparty: string;
    amount: number;
}

const formatAmount = (amount: number) => new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH"
}).format(amount);

const formatDate = (value: string | null) => {
    if (!value) return "—";
    const date = value.slice(0, 10).split("-");
    return date.length === 3 ? `${date[2]}.${date[1]}.${date[0]}` : value;
};

const SummaryCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    tone: "success" | "error" | "primary";
}> = ({title, value, icon, tone}) => {
    const colors = {
        success: {color: "success.main", background: "success.light"},
        error: {color: "error.main", background: "error.light"},
        primary: {color: "primary.main", background: "primary.light"}
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2
            }}
        >
            <Box sx={{minWidth: 0}}>
                <Typography variant="body2" color="text.secondary">{title}</Typography>
                <Typography variant="h5" sx={{mt: 1, fontWeight: 750, overflowWrap: "anywhere"}}>
                    {value}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    color: colors[tone].color,
                    bgcolor: colors[tone].background
                }}
            >
                {icon}
            </Box>
        </Paper>
    );
};

const FinancialJournalPage: React.FC = () => {
    const [operations, setOperations] = useState<FinancialOperation[]>([]);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError("");

        fetchResource<FinancialOperation[]>(API_ENDPOINTS.FINANCIAL_JOURNAL)
            .then(data => {
                if (active) setOperations(data);
            })
            .catch(() => {
                if (active) setError("Не вдалося завантажити журнал фінансових операцій.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const filteredOperations = useMemo(
        () => operations.filter(item => filter === "all" || item.direction === filter),
        [operations, filter]
    );

    const totals = useMemo(() => operations.reduce(
        (result, item) => {
            result[item.direction] += item.amount;
            return result;
        },
        {income: 0, expense: 0}
    ), [operations]);

    return (
        <Box className="crm-page" sx={{display: "flex", flexDirection: "column", gap: 2.5}}>
            <Box
                className="crm-page-heading"
                sx={{
                    mb: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: {xs: "flex-start", sm: "center"},
                    flexWrap: "wrap",
                    gap: 2
                }}
            >
                <Box>
                    <Typography className="crm-page-title" component="h1" variant="h4">
                        Журнал фінансових операцій
                    </Typography>
                    <Typography className="crm-page-description" color="text.secondary">
                        Єдиний перелік закупівель, продажів, повернень та інших витрат
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshOutlined/>}
                    onClick={() => setRefreshKey(value => value + 1)}
                    disabled={loading}
                >
                    Оновити
                </Button>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={4}>
                    <SummaryCard
                        title="Надходження"
                        value={formatAmount(totals.income)}
                        icon={<TrendingUpOutlined/>}
                        tone="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                    <SummaryCard
                        title="Витрати"
                        value={formatAmount(totals.expense)}
                        icon={<TrendingDownOutlined/>}
                        tone="error"
                    />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <SummaryCard
                        title="Різниця надходжень і витрат"
                        value={formatAmount(totals.income - totals.expense)}
                        icon={<AccountBalanceWalletOutlined/>}
                        tone="primary"
                    />
                </Grid>
            </Grid>

            <Alert severity="info">
                Надходження відображають повну вартість продажів, а не підтверджені платежі. Повернення клієнтам відображаються окремими витратними операціями.
            </Alert>

            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2}}>
                <FormControl size="small" sx={{minWidth: {xs: "100%", sm: 220}}}>
                    <InputLabel id="financial-journal-filter-label">Тип операцій</InputLabel>
                    <Select
                        labelId="financial-journal-filter-label"
                        value={filter}
                        label="Тип операцій"
                        onChange={event => setFilter(event.target.value as "all" | "income" | "expense")}
                    >
                        <MenuItem value="all">Усі операції</MenuItem>
                        <MenuItem value="income">Надходження</MenuItem>
                        <MenuItem value="expense">Витрати</MenuItem>
                    </Select>
                </FormControl>
                {!loading && !error && (
                    <Chip
                        size="small"
                        variant="outlined"
                        label={`Операцій: ${filteredOperations.length}`}
                    />
                )}
            </Box>

            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => setRefreshKey(value => value + 1)}>
                            Повторити
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{display: "flex", justifyContent: "center", py: 8}}>
                    <CircularProgress/>
                </Box>
            ) : !error ? (
                <TableContainer component={Paper} sx={{width: "100%", overflowX: "auto"}}>
                    <Table size="small" sx={{minWidth: 760}}>
                        <TableHead>
                            <TableRow>
                                <RenderHeaderCell>Дата</RenderHeaderCell>
                                <RenderHeaderCell>Операція</RenderHeaderCell>
                                <RenderHeaderCell>Опис</RenderHeaderCell>
                                <RenderHeaderCell>Контрагент</RenderHeaderCell>
                                <RenderHeaderCell>Сума</RenderHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOperations.map(item => (
                                <TableRow key={item.id} hover>
                                    <TableCell sx={{whiteSpace: "nowrap"}}>{formatDate(item.date)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            color={item.direction === "income" ? "success" : "default"}
                                            label={item.type}
                                        />
                                    </TableCell>
                                    <TableCell sx={{minWidth: 180}}>{item.description}</TableCell>
                                    <TableCell sx={{minWidth: 140}}>{item.counterparty || "—"}</TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            color: item.direction === "income" ? "success.main" : "error.main",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        {item.direction === "income" ? "+" : "−"}{formatAmount(item.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredOperations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{py: 5, color: "text.secondary"}}>
                                        Фінансових операцій не знайдено
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}
        </Box>
    );
};

export default FinancialJournalPage;
