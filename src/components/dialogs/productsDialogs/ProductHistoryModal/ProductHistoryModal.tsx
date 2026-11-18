import React, {ReactNode, useEffect, useRef, useState} from "react";
import axios from "axios";
import {
    DialogContent,
    MenuItem,
    Paper,
    Select, SelectChangeEvent,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableFooter,
    TableHead,
    TableRow,
    Tabs, Typography
} from "@mui/material";
import CustomDialog from "../../CustomDialog/CustomDialog";
import {ICustomer, ISupplierFull} from "../../../../utils/types";
import StockHistoryTable from "./StockHistoryTable";
import PurchaseHistoryTable from "./PurchaseHistoryTable";
import SalesHistoryTable from "./SalesHistoryTable";
import CombinedHistoryTable from "./CombinedHistoryTable";
import {onDeleteHistoryRecord} from "../../../../api/_history";
import {fetchProductHistory} from "../../../../api/_product";
import {useAuth} from "../../../context/AuthContext";
import {useSnackbarMessage} from "../../../Provider/SnackbarMessageContext";
import {useProducts} from "../../../Provider/ProductContext";

//TODO Add refresh data

export interface ProductHistoryRecord {
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
    supplier?: ISupplierFull;
    sale_date?: string;
    price?: number;
    quantity_sold?: number;
    customer?: ICustomer;
}

interface IPurchaseHistorySupplier {
    id: number;
    name: string;
    contact_info: string | null;
}

export interface IProductPurchaseHistoryRecord {
    id: number;
    product_id: number;
    purchase_date: string; // або Date, якщо парсити вручну
    purchase_price_per_item: number;
    purchase_total_price: number;
    quantity_purchase: number;
    supplier_id: number;
    supplier: ISupplierFull;
}

interface IProductHistoryRecordCustomer {
    id: number;
    name: string;
    email: string;
    address: string;
    phone_number: string;
}


export interface IProductSaleHistoryRecord {
    id: number;
    product_id: number;
    quantity_sold: number;
    selling_price_per_item: number;
    selling_total_price: number;
    packaging_material_id: number | null;
    packaging_quantity: number;
    total_packaging_cost: number;
    profit: number;
    sale_date: string; // ISO string, або можеш використати `Date` якщо парсиш
    customer_id: number;
    customer: IProductHistoryRecordCustomer;
}

export interface IStockHistoryRecord {
    id: number;
    product_id: number,
    timestamp: string;
    change_type: string;
    change_amount: number;
    quantity_before?: number | null;
    quantity_after?: number | null;
    reason?: string | null;
}

export interface IProductHistory {
    stock: IStockHistoryRecord[];
    purchase: IProductPurchaseHistoryRecord[];
    sales: IProductSaleHistoryRecord[];
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
    const [productHistory, setProductHistory] = useState<IProductHistory>({stock: [], purchase: [], sales: []});
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [selectedView, setSelectedView] = useState<number>(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const {isAuthenticated} = useAuth();
    const {showSnackbarMessage} = useSnackbarMessage();
    const {fetchProductsFunc} = useProducts();
    const historyRequestId = useRef(0);

    useEffect(() => {
        if (!openHistory) return;

        const requestId = ++historyRequestId.current;

        fetchProductHistory(productId)
            .then(response => {
                if (requestId !== historyRequestId.current) return;

                setProductHistory({
                    stock: response.data.stock_history,
                    purchase: response.data.purchase_history,
                    sales: response.data.sale_history,
                });
            })
            .catch(error => {
                if (requestId !== historyRequestId.current) return;
                console.error('There was an error fetching the product history!', error);
            });

        return () => {
            historyRequestId.current += 1;
        };
    }, [openHistory, productId]);

    const refreshProductHistory = async () => {
        const requestId = ++historyRequestId.current;
        const requestedProductId = productId;

        try {
            showSnackbarMessage("Запис успішно видалений", "success");

            const response = await fetchProductHistory(requestedProductId);

            if (requestId !== historyRequestId.current) return;

            setProductHistory({
                stock: response.data.stock_history,
                purchase: response.data.purchase_history,
                sales: response.data.sale_history,
            });

            fetchProductsFunc();
        } catch (error) {
            if (requestId !== historyRequestId.current) return;
            console.error('Помилка при оновленні історії товару:', error);
        }
    };

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


    // const handleDeleteHistoryRecord = (historyType: string, historyId: number) => {
    //     onDeleteHistoryRecord(productId, historyType, historyId)
    //         .then(() => {
    //             // Оновити історію після видалення
    //             fetchProductHistory(productId);
    //         })
    //         .catch((error) => {
    //             console.error('Error deleting history record:', error);
    //         });
    // };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleViewChange = (event: SelectChangeEvent<number>, child: ReactNode) => {
        setSelectedView(event.target.value as number);
    };

    function sortByDate(history: IStockHistoryRecord[], dateKey: 'timestamp'): IStockHistoryRecord[];
    function sortByDate(history: IProductPurchaseHistoryRecord[], dateKey: 'purchase_date'): IProductPurchaseHistoryRecord[];
    function sortByDate(history: IProductSaleHistoryRecord[], dateKey: 'sale_date'): IProductSaleHistoryRecord[];
    function sortByDate(
        history: IStockHistoryRecord[] | IProductPurchaseHistoryRecord[] | IProductSaleHistoryRecord[],
        dateKey: 'timestamp' | 'purchase_date' | 'sale_date'
    ) {
        return history.slice().sort((a, b) => {
            const getDate = (record: IStockHistoryRecord | IProductPurchaseHistoryRecord | IProductSaleHistoryRecord) => {
                if (dateKey === 'timestamp') return (record as IStockHistoryRecord).timestamp;
                if (dateKey === 'purchase_date') return (record as IProductPurchaseHistoryRecord).purchase_date;
                return (record as IProductSaleHistoryRecord).sale_date;
            };
            const dateA = new Date(getDate(a)).getTime();
            const dateB = new Date(getDate(b)).getTime();
            return dateB - dateA; // сортування за спаданням (найновіші записи будуть першими)
        });
    }

    return (
        <CustomDialog
            open={openHistory}
            handleClose={onClose}
            title={`Історія товару "${productName}"`}
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
                    <StockHistoryTable sortByDate={sortByDate} productHistory={productHistory}/>}
                    {(isMobile ? selectedView : tabIndex) === 1 &&
                    <PurchaseHistoryTable
                        refreshHistory={refreshProductHistory}
                        isAuthenticated={isAuthenticated}
                        onDeleteHistoryRecord={onDeleteHistoryRecord} sortByDate={sortByDate}
                        productHistory={productHistory}/>}
                    {(isMobile ? selectedView : tabIndex) === 2 &&
                    <SalesHistoryTable
                        refreshHistory={refreshProductHistory}
                        isAuthenticated={isAuthenticated} onDeleteHistoryRecord={onDeleteHistoryRecord}
                        sortByDate={sortByDate}
                        productHistory={productHistory}/>}
                    {(isMobile ? selectedView : tabIndex) === 3 &&
                    <CombinedHistoryTable productHistory={productHistory}/>}
                </div>
            </DialogContent>
        </CustomDialog>
    );
};

export default ProductHistoryModal;
