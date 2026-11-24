import {describe, expect, it} from 'vitest';
import {findDuplicateProductName, isDuplicateProductNameError} from '../src/utils/productNameValidation';
import {IProduct} from '../src/utils/types';

const products = [
    {id: 1, name: 'Чай зелений'} ,
    {id: 2, name: 'Кава мелена'}
] as IProduct[];

describe('findDuplicateProductName', () => {
    it('detects an exact duplicate regardless of letter case and surrounding spaces', () => {
        expect(findDuplicateProductName('  ЧАЙ ЗЕЛЕНИЙ ', products)).toBe(true);
    });

    it('allows a unique product name', () => {
        expect(findDuplicateProductName('Чай чорний', products)).toBe(false);
    });

    it('does not treat the current product name as a duplicate during editing', () => {
        expect(findDuplicateProductName('Чай зелений', products, 1)).toBe(false);
    });

    it('still detects another product when editing the current product', () => {
        expect(findDuplicateProductName('Кава мелена', products, 1)).toBe(true);
    });

    it('ignores an empty name', () => {
        expect(findDuplicateProductName('   ', products)).toBe(false);
    });
});

describe('isDuplicateProductNameError', () => {
    it('recognizes HTTP 409 conflict responses', () => {
        expect(isDuplicateProductNameError({response: {status: 409}})).toBe(true);
    });

    it('does not classify other errors as duplicate-name conflicts', () => {
        expect(isDuplicateProductNameError({response: {status: 500}})).toBe(false);
        expect(isDuplicateProductNameError(new Error('network error'))).toBe(false);
    });
});
