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
    TableContainer,
    TableHead,
    TableRow,
    Tabs
} from "@mui/material";

import CustomDialog from "../CustomDialog/CustomDialog";


//TODO Type interfaces

interface ProductHistoryRecord {
    id: number;
    date?: string; // for stock history
    change_type?: string;
    change_amount?: number;
    purchase_date?: string; // for purchase history
    price_per_item?: number;
    total_price?: number;
    supplier?: string;
    sale_date?: string; // for sales history
    price?: number;
    quantity_sold?: number;
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
const ProductHistoryModal = ({productId, openHistory, onClose}: IProductHistoryModal) => {
    const [productHistory, setProductHistory] = useState<ProductHistory>({stock: [], purchase: [], sales: []});
    const [tabIndex, setTabIndex] = useState<number>(0);
    useEffect(() => {
        if (openHistory) {
            fetchProductHistory(productId);
        }
    }, [openHistory, productId]);

    const fetchProductHistory = (productId:number) => {
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

    const handleTabChange = (event:React.SyntheticEvent, newValue:number) => {
        console.log(event);
        setTabIndex(newValue);
    };

    return (
        <CustomDialog
            open={openHistory}
            handleClose={onClose}
            title={"Product History"}
            maxWidth={"sm"}
        >
            <DialogContent>
                <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                    <Tab label="History of Changes"/>
                    <Tab label="Purchase History"/>
                    <Tab label="Sales History"/>
                </Tabs>
                <TabPanel value={tabIndex} index={0}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Change Type</TableCell>
                                    <TableCell>Change Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(productHistory.stock && productHistory.stock.length > 0) && productHistory.stock.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.date!).toLocaleString()}</TableCell>
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
                                    <TableCell>Date</TableCell>
                                    <TableCell>Price per Item</TableCell>
                                    <TableCell>Total Price</TableCell>
                                    <TableCell>Supplier</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(productHistory.purchase && productHistory.purchase.length > 0) && productHistory.purchase.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.purchase_date!).toLocaleString()}</TableCell>
                                        <TableCell>{record.price_per_item}</TableCell>
                                        <TableCell>{record.total_price}</TableCell>
                                        <TableCell>{record.supplier}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
                <TabPanel value={tabIndex} index={2}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Quantity Sold</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(productHistory.sales && productHistory.sales.length > 0) && productHistory.sales.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{new Date(record.sale_date!).toLocaleString()}</TableCell>
                                        <TableCell>{record.price}</TableCell>
                                        <TableCell>{record.quantity_sold}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </DialogContent>
        </CustomDialog>
    );
};
export default ProductHistoryModal