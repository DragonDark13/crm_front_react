import React, {useEffect, useMemo, useState} from "react";
import {
    Alert,
    CircularProgress,
    FormControl,
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

const FinancialJournalPage: React.FC = () => {
    const [operations, setOperations] = useState<FinancialOperation[]>([]);
    const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

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
    }, []);

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
        <div>
            <Typography variant="h5" component="h1" gutterBottom>
                Журнал фінансових операцій
            </Typography>

            <div style={{display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20}}>
                <Paper sx={{p: 2, minWidth: 190}}>
                    <Typography color="text.secondary" variant="body2">Надходження</Typography>
                    <Typography variant="h6">{formatAmount(totals.income)}</Typography>
                </Paper>
                <Paper sx={{p: 2, minWidth: 190}}>
                    <Typography color="text.secondary" variant="body2">Витрати</Typography>
                    <Typography variant="h6">{formatAmount(totals.expense)}</Typography>
                </Paper>
                <Paper sx={{p: 2, minWidth: 190}}>
                    <Typography color="text.secondary" variant="body2">Різниця надходжень і витрат</Typography>
                    <Typography variant="h6">{formatAmount(totals.income - totals.expense)}</Typography>
                </Paper>
            </div>

            <Alert severity="info" sx={{mb: 2}}>
                Надходження відображають повну вартість продажів, а не підтверджені платежі. Повернення клієнтам відображаються окремими витратними операціями.
            </Alert>

            <FormControl size="small" sx={{minWidth: 220, mb: 2}}>
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

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            {loading ? (
                <div style={{display: "flex", justifyContent: "center", padding: 32}}>
                    <CircularProgress/>
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
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
                                <TableRow key={item.id}>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.counterparty || "—"}</TableCell>
                                    <TableCell sx={{
                                        color: item.direction === "income" ? "success.main" : "error.main",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {item.direction === "income" ? "+" : "−"}{formatAmount(item.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredOperations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Фінансових операцій не знайдено
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default FinancialJournalPage;
