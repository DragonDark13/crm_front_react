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
    'snackbarNotifyOpen'
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