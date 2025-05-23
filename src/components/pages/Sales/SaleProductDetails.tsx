import React from "react";
import {TableRow, TableCell, Collapse, Table, TableHead, TableBody} from "@mui/material";

const SaleProductDetails = ({sale}) => (
    <TableRow>
        <TableCell colSpan={7}>
            <Collapse in={true} timeout="auto" unmountOnExit>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Тип</TableCell>
                            <TableCell>Назва</TableCell>
                            <TableCell>Постачальник</TableCell>
                            <TableCell>Ціна за од.</TableCell>
                            <TableCell>Кількість</TableCell>
                            <TableCell>Сума</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Товар</TableCell>
                            <TableCell>{sale.product_name}</TableCell>
                            <TableCell>{sale.supplier?.name || 'Невідомо'}</TableCell>
                            <TableCell>{sale.unit_price}</TableCell>
                            <TableCell>{sale.quantity_sold}</TableCell>
                            <TableCell>{sale.total_price}</TableCell>
                        </TableRow>
                        {sale.packaging_details?.map(packaging => (
                            <TableRow key={packaging.package_id}>
                                <TableCell>Пакування</TableCell>
                                <TableCell>{packaging.packaging_name}</TableCell>
                                <TableCell>{packaging.supplier?.name || 'Невідомо'}</TableCell>
                                <TableCell>{packaging.unit_price}</TableCell>
                                <TableCell>{packaging.quantity_sold}</TableCell>
                                <TableCell>{packaging.total_price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Collapse>
        </TableCell>
    </TableRow>
);

export default SaleProductDetails;
