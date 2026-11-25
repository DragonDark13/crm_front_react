import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ConfirmDeleteModal from '../src/components/dialogs/ConfirmDeleteModal/ConfirmDeleteModal';

describe('ConfirmDeleteModal', () => {
    it('defaults to deleting only the product', () => {
        const handleDelete = vi.fn();

        render(
            <ConfirmDeleteModal
                openConfirmDeleteModal
                handleCloseDeleteModal={vi.fn()}
                selectedDeleteModalProductId={110}
                handleDelete={handleDelete}
            />
        );

        fireEvent.click(screen.getByRole('button', {name: 'Видалити товар'}));

        expect(handleDelete).toHaveBeenCalledWith(110, 'product_only');
    });

    it('requires an explicit choice to delete the product and related data', () => {
        const handleDelete = vi.fn();

        render(
            <ConfirmDeleteModal
                openConfirmDeleteModal
                handleCloseDeleteModal={vi.fn()}
                selectedDeleteModalProductId={110}
                handleDelete={handleDelete}
            />
        );

        fireEvent.click(screen.getByRole('radio', {name: 'Видалити товар і всі пов’язані дані'}));
        fireEvent.click(screen.getByRole('button', {name: 'Видалити все'}));

        expect(handleDelete).toHaveBeenCalledWith(110, 'all_related');
        expect(screen.queryAllByText(/Безповоротно видаляться історія закупівель/).length).toBeGreaterThan(0);
    });
});
