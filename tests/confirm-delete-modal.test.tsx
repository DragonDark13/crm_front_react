import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import ConfirmDeleteModal from '../src/components/dialogs/ConfirmDeleteModal/ConfirmDeleteModal';

describe('ConfirmDeleteModal', () => {
    it('deletes only the product and keeps the historical records protected', () => {
        const handleDelete = vi.fn();

        render(
            <ConfirmDeleteModal
                openConfirmDeleteModal
                handleCloseDeleteModal={vi.fn()}
                selectedDeleteModalProductId={110}
                handleDelete={handleDelete}
            />
        );

        expect(screen.queryByText('Видалити товар і всі пов’язані дані')).not.toBeInTheDocument();
        expect(screen.getByText(/Пов’язані історичні записи не видаляються/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: 'Видалити товар'}));

        expect(handleDelete).toHaveBeenCalledWith(110, 'product_only');
    });
});
