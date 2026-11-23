import {IProduct} from "./types";

const normalizeSearchText = (value: string): string =>
    value
        .normalize('NFKC')
        .toLocaleLowerCase('uk-UA')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/\s+/g, ' ');

export const matchesProductSearch = (
    product: Pick<IProduct, 'name' | 'article'>,
    searchTerm: string
): boolean => {
    const searchWords = normalizeSearchText(searchTerm).split(' ').filter(Boolean);

    if (searchWords.length === 0) return true;

    const searchableFields = [
        normalizeSearchText(product.name ?? ''),
        normalizeSearchText(product.article ?? '')
    ];

    return searchWords.every(word =>
        searchableFields.some(field => field.includes(word))
    );
};
