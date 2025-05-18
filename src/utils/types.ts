import NotificationPanel from "../components/NotificationPanel/NotificationPanel";
import ex = CSS.ex;

export interface IBaseProduct {
    name: string;
    available_quantity: number;
    total_quantity: number;
    sold_quantity: number;
    purchase_total_price: number;
    purchase_price_per_item: number;
    selling_total_price: number;
    selling_price_per_item: number;
    selling_quantity: number
}

export interface IProduct extends IBaseProduct {
    id: number;
    category_ids: number[]
    supplier: ISupplier | null
    created_date: string
}

export interface ISupplierID {
    supplier_id: number | '';
}

export interface INewProduct extends IBaseProduct, ISupplierID {
    category_ids: number[]
    created_date: string
}

export interface IEditProduct extends IBaseProduct, ISupplierID {
    id: number;
    category_ids: number[]
    created_date: string

}

export interface ICategory {
    id: number
    name: string;
}

export interface IPurchaseData extends ISupplierID {
    quantity: number
    purchase_price_per_item: number,
    purchase_total_price: number,
    purchase_date: string,
}

export interface ISaleData {
    customer: number | '',
    quantity: number,
    selling_price_per_item: number,
    selling_total_price: number,
    sale_date: string
    productId: number
    packaging_id?: number | string
    packaging_quantity?: number
    total_cost_price: number
    total_packaging_cost?: number
    purchase_price_per_item: number
}

export interface ISupplier {
    id: number;
    name: string;
    contact_info: string | null
}

export interface INewSupplier {
    address?: string
    name: string,
    contact_info?: string,
    email?: string,
    phone_number?: string
}

export type ModalNames =
    | 'openAdd'
    | 'openSale'
    | 'openEdit'
    | 'openPurchase'
    | 'openDrawer'
    | 'openDelete'
    | 'openHistory'
    | 'openCategoryCreate'
    | 'openAddSupplierOpen'
    | 'openNotificationDrawer'
    | 'snackbarNotifyOpen'
    | 'createCustomerDialog'
    | 'addNewPackage'
    | 'addNewGiftBox'
    ;

export const modalNames: ModalNames[] = [
    'openAdd',
    'openSale',
    'openEdit',
    'openPurchase',
    'openDrawer',
    'openDelete',
    'openHistory',
    'openCategoryCreate',
    'openAddSupplierOpen',
    'openNotificationDrawer',
    'snackbarNotifyOpen',
    'createCustomerDialog',
    'addNewPackage',
    'addNewGiftBox'
];

export interface INotificationPanel {
    lowQuantityProducts: IProduct[];
    handleListItemClick: (arg: number) => void
}

export interface IConfirmDeleteModal {
    openConfirmDeleteModal: boolean;
    handleCloseDeleteModal: () => void;
    selectedDeleteModalProductId: number;
    handleDelete: () => void;
}

export interface IStateFilters {
    categories: number[]
    suppliers: number[]
    priceRange: [number, number]
}

export interface ICustomer {
    id: number;              // Унікальний ідентифікатор покупця
    name: string;            // Ім'я покупця, обов'язкове поле
    contact_info?: string;   // Контактна інформація (може бути відсутня)
    address?: string;        // Адреса (може бути відсутня)
    email?: string;          // Email, унікальний, може бути відсутній
    phone_number?: string;   // Номер телефону, може бути відсутній
}

export interface ISupplier {
    id: number;              // Унікальний ідентифікатор постачальника
    name: string;            // Ім'я постачальника, унікальне,
    contact_info: string;   // Контактна інформація, може бути відсутня
    email: string;          // Email, може бути відсутнім
    phone_number: string;   // Номер телефону, може бути відсутнім
    address: string;        // Адреса, може бути відсутня
}

export interface ICustomerDetails {
    id: number;
    name: string;
    contact_info?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    sales?: ISaleHistory[];
}

export interface ISaleHistory {
    id: number;
    product: string;
    quantity_sold: number;
    selling_price_per_item: number;
    selling_total_price: number;
    sale_date: string;
}

export interface IMaterialSupplier {
    address: string | null;
    contact_info: string | null;
    email: string | null;
    id: number;
    name: string;
    phone_number: string | null;
}

export interface IMaterial {
    available_quantity: number;
    created_date: string; // or Date if you prefer to parse it into a Date object
    id: number;
    name: string;
    packaging_material_supplier_id: number;
    purchase_price_per_unit: number;
    reorder_level: number;
    supplier: IMaterialSupplier;
    total_quantity: number;
    total_purchase_cost: number;
    available_stock_cost: number;
}

export interface MaterialHistoryItem {
    date: string; // Дата події
    description: string; // Опис події
    quantity: number; // Кількість
}

export interface PackagingMaterialHistory {
    packaging_material_id: number;
    purchase_history: Array<{
        id: number;
        material_id: number;
        purchase_date: string;
        purchase_price_per_unit: number;
        purchase_total_price: number;
        quantity_purchased: number;
        supplier_id: number;
    }>;
    sales_history: Array<{
        id: number;
        packaging_material_id: number;
        packaging_quantity: number;
        sale_date: string;
        sale_id: number;
        total_packaging_cost: number;
    }>;
    stock_history: Array<{
        id: number;
        material_id: number;
        timestamp: string;
        change_amount: number;
        change_type: string
    }>;
}

export interface IPurchasePackagingMaterial {
    name: string;                // Назва упаковочного матеріалу
    supplier_id: number;          // ID постачальника
    quantity_purchased: string;   // Кількість придбаного матеріалу
    purchase_price_per_unit: string; // Ціна за одиницю матеріалу
    total_purchase_cost: string;   // Загальна вартість покупки
}

interface GiftSetItem {
    item_id: number;
    item_type: "product" | "packaging";
    quantity: number;
}

export interface GiftSetPayload {
    name: string;
    description: string;
    gift_selling_price: number;
    items: GiftSetItem[];
}

export interface IHandleAddNewGiftBox {
    name: string,
    description: string,
    price: number,
    selectedProducts: any[],
    selectedPackaging: any[],
}

export interface IProductForGiftSet {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
}

export interface IPackagingForGiftSet {
    packaging_id: number;
    name: string;
    quantity: number;
    price: number;
}


export interface IGiftSet {
    id: number;
    name: string;
    description: string;
    total_price: number;
    gift_selling_price: number;
    products: IProductForGiftSet[];
    packagings: IPackagingForGiftSet[];
}

export interface ISaleProductModal {
    openSale: boolean;
    handleCloseSale: () => void;
    saleData: ISaleData;
    setSaleData: (data: ISaleData) => void;
    handleSale: () => void;
    nameProduct: string;
    purchasePricePerItem: number
    quantityOnStock: number,
    isAuthenticated: boolean;
}

export interface PurchaseMaterialDialogProps {
    open: boolean;
    onClose: () => void;
    materialName: string;
    materialId: number;
    onPurchaseSuccess: () => void;
    defaultSupplierId: number | null;
    defaultPricePerUnit: number | null;
    isAuthenticated: boolean;
}

export interface AddPackagingSupplierDialogProps {
    openAddSupplier: boolean;
    handleCloseAddSupplier: () => void;
    isAuthenticated: boolean;
}

export interface Investment {
    supplier: string;
    id: number;
    type_name: string;
    cost: number;
    date: string;
}

export interface INewInvestment {
    supplier: string;
    type_name: string;
    cost: number;
    date: string;
}
