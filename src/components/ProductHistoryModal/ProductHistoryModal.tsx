import React, {useEffect, useState} from "react";
import axios from "axios";

//TODO add scss style

import {
    DialogContent,

    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableFooter,
    TableHead,
    TableRow,
    Tabs, Typography
} from "@mui/material";

import CustomDialog from "../CustomDialog/CustomDialog";


//TODO Type interfaces

interface ProductHistoryRecord {
    id: number;
    timestamp?: string; // for stock history
    change_type?: string;
    change_amount?: number;
    quantity_purchase?: number;
    purchase_date?: string; // for purchase history
    price_per_item?: number;
    total_price?: number;
    supplier?: string;
    sale_date?: string; // for sales history
    price?: number;
    quantity_sold?: number;
    customer?: string;
}

interface ProductHistory {
    stock: ProductHistoryRecord[];
    purchase: ProductHistoryRecord[];
    sales: ProductHistoryRecord[];
}

interface IProductHistoryModal {
    productId: number;
    openHistory: boolean;
    onClose: () => void;
    productName: string
}

interface TabPanelProps {
    value: number;
    index: number;
    children: React.ReactNode;
}

interface TabPanelProps {
    value: number;
    index: number;
    children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({value, index, children}) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <div>{children}</div>}
        </div>
    );
};
const ProductHistoryModal = ({productId, openHistory, onClose, productName}: IProductHistoryModal) => {
    const [productHistory, setProductHistory] = useState<ProductHistory>({stock: [], purchase: [], sales: []});
    const [tabIndex, setTabIndex] = useState<number>(0);
    useEffect(() => {
        if (openHistory) {
            fetchProductHistory(productId);
        }
    }, [openHistory, productId]);

    const fetchProductHistory = (productId: number) => {
        axios.get(`http://localhost:5000/api/product/${productId}/history`)
            .then(response => {
                setProductHistory({
                    stock: response.data.stock_history,
                    purchase: response.data.purchase_history,
                    sales: response.data.sale_history,
                });
            })
            .catch(error => {
                console.error('There was an error fetching the product history!', error);
            });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    // TODO НАзву товару до заголовку
    // TODO Перекласти

    const sortByDate = (history: ProductHistoryRecord[], dateKey: keyof ProductHistoryRecord) => {
        return history.slice().sort((a, b) => {
            const dateA = new Date(a[dateKey]!).getTime();
            const dateB = new Date(b[dateKey]!).getTime();
            return dateB - dateA; // сортування за спаданням (найновіші записи будуть першими)
        });
    };

    return (
        <CustomDialog
            open={openHistory}
            handleClose={onClose}
            title={`Історія товару ${productName}`}
            maxWidth={"xl"}
        >
            <DialogContent>
                <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                    <Tab label="Історія змін"/>
                    <Tab label="Історія закупівель"/>
                    <Tab label="Історія продажів"/>
                    <Tab label="закупівель && продажів"/>
                </Tabs>
                <TabPanel value={tabIndex} index={0}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>Тип зміни</TableCell>
                                    <TableCell>Зміни по Кількості</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(productHistory.stock && productHistory.stock.length > 0) &&
                                sortByDate(productHistory.stock, 'timestamp').map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.timestamp!).toLocaleString()}</TableCell>
                                        <TableCell>{record.change_type}</TableCell>
                                        <TableCell>{record.change_amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabIndex} index={1}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>Постачальник</TableCell>
                                    <TableCell>Ціна за одиницю</TableCell>
                                    <TableCell>Кількість закупівлі</TableCell>
                                    <TableCell>Загальна ціна</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(productHistory.purchase && productHistory.purchase.length > 0) &&
                                sortByDate(productHistory.purchase, 'purchase_date').map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.purchase_date!).toLocaleString()}</TableCell>
                                        <TableCell>{record.supplier}</TableCell>
                                        <TableCell>{record.price_per_item}</TableCell>
                                        <TableCell>{record.quantity_purchase}</TableCell>
                                        <TableCell>{record.total_price}</TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                            {productHistory.purchase && productHistory.purchase.length > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} align="right"><strong>Загальна
                                            кількість:</strong></TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}> {productHistory.purchase.reduce((sum, record) => sum + (record.quantity_purchase || 0), 0)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant={"subtitle2"}>  {productHistory.purchase
                                                .reduce((sum, record) => sum + parseFloat(String(record.total_price)) || 0, 0)
                                                .toFixed(2)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </TableContainer>
                </TabPanel>

                <TabPanel value={tabIndex} index={2}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>Клієнт</TableCell>
                                    <TableCell>Ціна</TableCell>
                                    <TableCell>Кількість проданих одиниць</TableCell>
                                    <TableCell>Загальна ціна</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(productHistory.sales && productHistory.sales.length > 0) &&
                                sortByDate(productHistory.sales, 'sale_date').map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.sale_date!).toLocaleString()}</TableCell>
                                        <TableCell>{record.customer}</TableCell>
                                        <TableCell>{record.price_per_item}</TableCell>
                                        <TableCell>{record.quantity_sold}</TableCell>
                                        <TableCell>{record.total_price}</TableCell>
                                    </TableRow>
                                ))
                                }
                            </TableBody>
                            {productHistory.sales && productHistory.sales.length > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} align="right"><strong>Загальна
                                            кількість:</strong></TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}>{productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}> {productHistory.sales.reduce((sum, record) => sum + record.total_price, 0).toFixed(2)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </TableContainer>
                </TabPanel>
                <TabPanel value={tabIndex} index={3}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>Тип</TableCell>
                                    <TableCell>Контрагент</TableCell>
                                    <TableCell>Ціна</TableCell>
                                    <TableCell>Кількість</TableCell>
                                    <TableCell>Загальна ціна</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productHistory && productHistory.purchase && productHistory.sales && (
                                    // Об'єднання та сортування закупівель і продажів
                                    [...productHistory.purchase.map(record => ({...record, type: 'purchase'})),
                                        ...productHistory.sales.map(record => ({...record, type: 'sale'}))]
                                        .sort((a, b) => {
                                            const dateA = a.purchase_date ? new Date(a.purchase_date).getTime() : 0;
                                            const dateB = b.purchase_date ? new Date(b.purchase_date).getTime() : 0;

                                            const dateSaleA = a.sale_date ? new Date(a.sale_date).getTime() : 0;
                                            const dateSaleB = b.sale_date ? new Date(b.sale_date).getTime() : 0;

                                            const finalDateA = dateA || dateSaleA;  // Якщо є дата закупівлі, використовується вона, інакше дата продажу
                                            const finalDateB = dateB || dateSaleB;  // Те саме для другого запису

                                            return finalDateA - finalDateB;
                                        }).map((record, index) => (
                                        <TableRow
                                            key={index}
                                            style={{backgroundColor: record.type === 'sale' ? '#d1e7dd' : '#f8d7da'}} // Колір для продажу і закупки
                                        >
                                            <TableCell>{new Date(record.purchase_date || record.sale_date!).toLocaleString()}</TableCell>
                                            <TableCell>{record.type === 'sale' ? 'Продаж' : 'Закупка'}</TableCell>
                                            <TableCell>{record.type === 'sale' ? record.customer : record.supplier}</TableCell>
                                            <TableCell>{record.price_per_item}</TableCell>
                                            <TableCell>{record.type === 'sale' ? record.quantity_sold : record.quantity_purchase}</TableCell>
                                            <TableCell>{record.total_price}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            {productHistory && productHistory.purchase && productHistory.sales && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={4} align="right">
                                            <strong>Загальна кількість продажів:</strong>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}>{productHistory.sales.reduce((sum, record) => sum + record.quantity_sold, 0)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}>{productHistory.sales.reduce((sum, record) => sum + record.total_price, 0).toFixed(2)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={4} align="right">
                                            <strong>Загальна кількість закупок:</strong>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}>{productHistory.purchase.reduce((sum, record) => sum + record.quantity_purchase, 0)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={"subtitle2"}>{productHistory.purchase.reduce((sum, record) => sum + parseFloat(String(record.total_price)) || 0, 0).toFixed(2)}</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </TableContainer>
                </TabPanel>

            </DialogContent>
        </CustomDialog>
    );
};
export default ProductHistoryModal