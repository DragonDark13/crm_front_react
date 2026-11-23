import {describe, expect, it} from 'vitest';
import {matchesProductSearch} from '../src/utils/productSearch';
import {IProduct} from '../src/utils/types';

const product = (name: string, article = ''): Pick<IProduct, 'name' | 'article'> => ({
    name,
    article
});

describe('matchesProductSearch', () => {
    it('finds a product by its complete multi-word name with punctuation', () => {
        expect(matchesProductSearch(
            product('Шкарпетки EU 40-43. Білі ГП кольоровий'),
            'Шкарпетки EU 40-43. Білі ГП кольоровий'
        )).toBe(true);
    });

    it('matches all query words regardless of their order', () => {
        expect(matchesProductSearch(
            product('Шкарпетки EU 40-43. Білі ГП кольоровий'),
            'кольоровий білі шкарпетки'
        )).toBe(true);
    });

    it('ignores repeated, leading and trailing whitespace', () => {
        expect(matchesProductSearch(
            product('Шкарпетки EU 40-43. Білі ГП кольоровий'),
            '  Шкарпетки   EU 40-43.   Білі ГП кольоровий  '
        )).toBe(true);
    });

    it('normalizes non-breaking spaces', () => {
        expect(matchesProductSearch(
            product('Шкарпетки EU 40-43. Білі ГП кольоровий'),
            'Шкарпетки\u00a0EU 40-43. Білі ГП кольоровий'
        )).toBe(true);
    });

    it('finds a product by article', () => {
        expect(matchesProductSearch(
            product('Шкарпетки білі', 'SKU-40-43'),
            'SKU-40-43'
        )).toBe(true);
    });

    it('requires every search word to match the name or article', () => {
        expect(matchesProductSearch(
            product('Шкарпетки EU 40-43. Білі ГП кольоровий'),
            'шкарпетки чорні'
        )).toBe(false);
    });

    it('returns all products for an empty search term', () => {
        expect(matchesProductSearch(product('Шкарпетки білі'), '   ')).toBe(true);
    });
});
