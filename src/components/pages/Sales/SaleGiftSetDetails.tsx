import React from "react";
import {TableRow, TableCell, Collapse, Table, TableHead, TableBody, Tooltip} from "@mui/material";
import {ShoppingBag, Luggage} from "@mui/icons-material";

const SaleGiftSetDetails = ({sale}) => (
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
                        {sale.products?.map((product) => (
                            <TableRow key={product.product_id}>
                                <TableCell>
                                    <Tooltip title="Одиничний товар">
                                        <ShoppingBag fontSize="small"/>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.supplier.name}</TableCell>
                                <TableCell>{product.unit_price}</TableCell>
                                <TableCell>{product.quantity}</TableCell>
                                <TableCell>{product.total_price}</TableCell>
                            </TableRow>
                        ))}
                        {sale.packagings?.map((packaging) => (
                            <TableRow key={packaging.packaging_id}>
                                <TableCell>
                                    <Tooltip title="Пакування">
                                        <Luggage fontSize="small"/>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{packaging.packaging_name}</TableCell>
                                <TableCell>{packaging.supplier.name}</TableCell>
                                <TableCell>{packaging.unit_price}</TableCell>
                                <TableCell>{packaging.quantity}</TableCell>
                                <TableCell>{packaging.total_price}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Collapse>
        </TableCell>
    </TableRow>
);

export default SaleGiftSetDetails;
