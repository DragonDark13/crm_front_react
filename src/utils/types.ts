export interface IBaseProduct {
    name: string;
    quantity: number;
    total_price: number;
    price_per_item: number;
}

export interface IProduct extends IBaseProduct {
    id: number;
    category_ids: number[]
    supplier: ISupplier | null
}

export interface ISupplierID {
    supplier_id: number | '';
}

export interface INewProduct extends IBaseProduct, ISupplierID {
    category_ids: number[]
}

export interface IEditProduct extends IBaseProduct, ISupplierID {
    id: number;
    category_ids: number[]
}

export interface ICategory {
    id: number
    name: string;
}

export interface IPurchaseData extends ISupplierID {
    quantity: number
    price_per_item: number,
    total_price: number,
    purchase_date: string,
}

export interface ISaleData {
    customer: string,
    quantity: number,
    price_per_item: number,
    total_price: number,
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

export interface INotificationPanel{
    lowQuantityProducts: IProduct[];
}
