import React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import RenderHeaderCell from "../../../_elements/RenderHeaderCell";

interface ProductAuditRecord {
    id: number;
    changed_by_username: string;
    action: string;
    field_name: string;
    old_value: string | null;
    new_value: string | null;
    reason: string | null;
    changed_at: string;
}

interface ProductAuditHistoryTableProps {
    records: ProductAuditRecord[];
}

const fieldLabels: Record<string, string> = {
    available_quantity: "Доступний залишок",
    purchase_price_per_item: "Закупівельна ціна",
    selling_price_per_item: "Ціна продажу",
};

const actionLabels: Record<string, string> = {
    manual_edit: "Редагування товару",
    inventory: "Інвентаризація",
    purchase: "Закупівля",
    sale: "Продаж",
};

const formatValue = (field: string, value: string | null) => {
    if (value === null || value === undefined) return "—";
    if (field.includes("price")) {
        const amount = Number(value);
        return Number.isFinite(amount)
            ? new Intl.NumberFormat("uk-UA", {style: "currency", currency: "UAH"}).format(amount)
            : value;
    }
    return value;
};

const ProductAuditHistoryTable: React.FC<ProductAuditHistoryTableProps> = ({records}) => (
    <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <RenderHeaderCell>Дата і час</RenderHeaderCell>
                    <RenderHeaderCell>Користувач</RenderHeaderCell>
                    <RenderHeaderCell>Дія</RenderHeaderCell>
                    <RenderHeaderCell>Поле</RenderHeaderCell>
                    <RenderHeaderCell>Було</RenderHeaderCell>
                    <RenderHeaderCell>Стало</RenderHeaderCell>
                    <RenderHeaderCell>Причина</RenderHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {records.length > 0 ? records.map(record => (
                    <TableRow key={record.id}>
                        <TableCell sx={{whiteSpace: "nowrap"}}>
                            {new Date(record.changed_at.replace(" ", "T")).toLocaleString("uk-UA")}
                        </TableCell>
                        <TableCell>{record.changed_by_username || "Невідомий користувач"}</TableCell>
                        <TableCell>{actionLabels[record.action] || record.action}</TableCell>
                        <TableCell>{fieldLabels[record.field_name] || record.field_name}</TableCell>
                        <TableCell>{formatValue(record.field_name, record.old_value)}</TableCell>
                        <TableCell>{formatValue(record.field_name, record.new_value)}</TableCell>
                        <TableCell>{record.reason || "—"}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary">
                                Нових записів аудиту поки немає
                            </Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </TableContainer>
);

export default ProductAuditHistoryTable;
