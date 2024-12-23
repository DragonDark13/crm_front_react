import NotificationPanel from "../components/NotificationPanel/NotificationPanel";

export interface IBaseProduct {
    name: string;
    quantity: number;
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
    customer: string,
    quantity: number,
    selling_price_per_item: number,
    selling_total_price: number,
    sale_date: string
    productId: number
}

export interface ISupplier {
    id: number;
    name: string;
    contact_info: string | null
}

export interface INewSupplier {
    name: string,
    contact_info: string
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
    'createCustomerDialog'
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
    contact_info?: string;   // Контактна інформація, може бути відсутня
    email?: string;          // Email, може бути відсутнім
    phone_number?: string;   // Номер телефону, може бути відсутнім
    address?: string;        // Адреса, може бути відсутня
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