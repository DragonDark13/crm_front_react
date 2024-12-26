import React, {useEffect, useState} from "react";
import axios from "axios";
import {
    DialogContent,
    MenuItem,
    Paper,
    Select,
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
import {ICustomer, ISupplier} from "../../../utils/types";
import StockHistoryTable from "./StockHistoryTable";
import PurchaseHistoryTable from "./PurchaseHistoryTable";
import SalesHistoryTable from "./SalesHistoryTable";
import CombinedHistoryTable from "./CombinedHistoryTable";

interface ProductHistoryRecord {
    id: number;
    timestamp?: string;
    change_type?: string;
    change_amount?: number;
    quantity_purchase?: number;
    purchase_date?: string;
    selling_price_per_item?: number;
    selling_total_price?: number;
    purchase_price_per_item?: number;
    purchase_total_price?: number;
    supplier?: ISupplier;
    sale_date?: string;
    price?: number;
    quantity_sold?: number;
    customer?: ICustomer;
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
    productName: string;
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
    const [selectedView, setSelectedView] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        if (openHistory) {
            fetchProductHistory(productId);
        }
    }, [openHistory, productId]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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

    const handleViewChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedView(event.target.value as number);
    };

    return (
        <CustomDialog
            open={openHistory}
            handleClose={onClose}
            title={`Історія товару ${productName}`}
            maxWidth={"xl"}
        >
            <DialogContent>
                {isMobile ? (
                    <Select
                        value={selectedView}
                        onChange={handleViewChange}
                        fullWidth
                        displayEmpty
                    >
                        <MenuItem value={0}>Історія змін</MenuItem>
                        <MenuItem value={1}>Історія закупівель</MenuItem>
                        <MenuItem value={2}>Історія продажів</MenuItem>
                        <MenuItem value={3}>Закупівель && Продажів</MenuItem>
                    </Select>
                ) : (
                    <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                        <Tab label="Історія змін"/>
                        <Tab label="Історія закупівель"/>
                        <Tab label="Історія продажів"/>
                        <Tab label="Закупівель && Продажів"/>
                    </Tabs>
                )}
                <div style={{marginTop: 16}}>
                    {(isMobile ? selectedView : tabIndex) === 0 &&
                    <StockHistoryTable stockHistory={productHistory.stock}/>}
                    {(isMobile ? selectedView : tabIndex) === 1 &&
                    <PurchaseHistoryTable purchaseHistory={productHistory.purchase}/>}
                    {(isMobile ? selectedView : tabIndex) === 2 &&
                    <SalesHistoryTable salesHistory={productHistory.sales}/>}
                    {(isMobile ? selectedView : tabIndex) === 3 &&
                    <CombinedHistoryTable purchaseHistory={productHistory.purchase}
                                          salesHistory={productHistory.sales}/>}
                </div>
            </DialogContent>
        </CustomDialog>
    );
};

export default ProductHistoryModal;
