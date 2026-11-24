import {IProduct} from "./types";

export const findDuplicateProductName = (
    name: string,
    products: IProduct[],
    excludedProductId?: number
): boolean => {
    const normalizedName = name.trim().toLocaleLowerCase('uk-UA');

    if (!normalizedName) return false;

    return products.some(product =>
        product.id !== excludedProductId &&
        product.name.trim().toLocaleLowerCase('uk-UA') === normalizedName
    );
};

export const isDuplicateProductNameError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object' || !('response' in error)) return false;

    const response = (error as {response?: {status?: number}}).response;
    return response?.status === 409;
};
