import React from 'react';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import ProductInventoryModal from '../src/components/dialogs/productsDialogs/ProductInventoryModal/ProductInventoryModal';
import {IProduct} from '../src/utils/types';

const product = {
    id: 41,
    name: 'Test product',
    article: 'TEST-41',
    available_quantity: 10,
    reserved_quantity: 2
} as IProduct;

const renderModal = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
    render(
        <ProductInventoryModal
            product={product}
            open
            onClose={vi.fn()}
            onSubmit={onSubmit}
        />
    );
    return onSubmit;
};

const quantityInput = () => screen.getByRole('textbox', {
    name: 'Фактична кількість (усі фізичні одиниці)'
}) as HTMLInputElement;

const submitButton = () => screen.getByRole('button', {name: 'Провести інвентаризацію'});
const inventoryDateInput = () => screen.getByLabelText(/Дата звірки/) as HTMLInputElement;
const chooseReason = (reason: string) => {
    fireEvent.mouseDown(screen.getByRole('combobox', {name: 'Що сталося з товаром?'}));
    fireEvent.click(screen.getByRole('option', {name: reason}));
};

afterEach(() => cleanup());

describe('ProductInventoryModal', () => {
    it('defaults the reconciliation date to the current local date', () => {
        renderModal();
        const today = new Date();
        const expectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        expect(inventoryDateInput().value).toBe(expectedDate);
    });

    it('disables inventory submission when the physical quantity is unchanged', () => {
        const onSubmit = renderModal();

        expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(submitButton());
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('disables inventory submission when the quantity is changed and then restored', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: '13'}});

        expect((submitButton() as HTMLButtonElement).disabled).toBe(false);

        fireEvent.change(quantityInput(), {target: {value: '12'}});
        expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(submitButton());
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits the selected reconciliation date', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: '13'}});
        fireEvent.change(inventoryDateInput(), {target: {value: '2026-11-20'}});
        fireEvent.click(submitButton());

        expect(onSubmit).toHaveBeenCalledWith(13, 'Невідомо', '2026-11-20');
    });

    it('requires a reconciliation date', () => {
        const onSubmit = renderModal();
        fireEvent.change(inventoryDateInput(), {target: {value: ''}});

        expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('increments and decrements the physical quantity', () => {
        renderModal();

        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[2]);
        expect(quantityInput().value).toBe('13');
        fireEvent.click(buttons[1]);
        expect(quantityInput().value).toBe('12');
    });

    it('does not decrement below zero', () => {
        renderModal();
        fireEvent.change(quantityInput(), {target: {value: '0'}});

        expect(quantityInput().value).toBe('0');
        expect((screen.getAllByRole('button')[1] as HTMLButtonElement).disabled).toBe(true);
    });

    it('accepts manually entered whole numbers', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: '125'}});
        fireEvent.click(submitButton());

        expect(onSubmit).toHaveBeenCalledWith(125, 'Невідомо', expect.any(String));
    });

    it.each(['-5', '1.5', '12abc', '9007199254740992'])(
        'preserves invalid input %s and prevents submission',
        (value) => {
            const onSubmit = renderModal();
            fireEvent.change(quantityInput(), {target: {value}});

            expect(quantityInput().value).toBe(value);
            expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
            expect(onSubmit).not.toHaveBeenCalled();
        }
    );

    it('does not submit an empty quantity', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: ''}});

        expect(quantityInput().value).toBe('');
        expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it.each(['Продано', 'Докуплено', 'Втрачено', 'Невідомо'])(
        'submits the selected reason: %s',
        (reason) => {
            const onSubmit = renderModal();
            fireEvent.change(quantityInput(), {target: {value: '13'}});
            chooseReason(reason);
            fireEvent.click(submitButton());

            expect(onSubmit).toHaveBeenCalledWith(13, reason, expect.any(String));
        }
    );

    it('requires a description when the reason is "Інше"', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: '13'}});
        chooseReason('Інше');

        expect(screen.getByRole('textbox', {name: 'Опиши, що сталося'})).toBeTruthy();
        expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
        expect(onSubmit).not.toHaveBeenCalled();

        fireEvent.change(screen.getByRole('textbox', {name: 'Опиши, що сталося'}), {
            target: {value: 'Пошкоджено'}
        });
        expect((submitButton() as HTMLButtonElement).disabled).toBe(false);
    });

    it('submits the description when the reason is "Інше"', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: '13'}});
        chooseReason('Інше');
        fireEvent.change(screen.getByRole('textbox', {name: 'Опиши, що сталося'}), {
            target: {value: 'Пошкоджено'}
        });
        fireEvent.click(submitButton());

        expect(onSubmit).toHaveBeenCalledWith(13, 'Інше: Пошкоджено', expect.any(String));
    });

    it('sends the selected reason together with the additional note', () => {
        const onSubmit = renderModal();
        fireEvent.change(quantityInput(), {target: {value: '13'}});
        fireEvent.change(screen.getByRole('textbox', {name: 'Додаткова примітка'}), {
            target: {value: 'Перевірено під час перерахунку'}
        });
        fireEvent.click(submitButton());

        expect(onSubmit).toHaveBeenCalledWith(13, 'Невідомо — Перевірено під час перерахунку', expect.any(String));
    });

    it('prevents repeated submissions while the first request is pending', async () => {
        let resolveSubmit: () => void = () => undefined;
        const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
            resolveSubmit = resolve;
        }));
        renderModal(onSubmit);
        fireEvent.change(quantityInput(), {target: {value: '13'}});

        fireEvent.click(submitButton());
        fireEvent.click(submitButton());

        expect(onSubmit).toHaveBeenCalledOnce();
        expect((submitButton() as HTMLButtonElement).disabled).toBe(true);

        resolveSubmit();
        await waitFor(() => expect((submitButton() as HTMLButtonElement).disabled).toBe(false));
    });

    it('keeps entered data and allows retry after the submit request fails', async () => {
        const onSubmit = vi.fn()
            .mockRejectedValueOnce(new Error('API error'))
            .mockResolvedValueOnce(undefined);
        renderModal(onSubmit);

        fireEvent.change(quantityInput(), {target: {value: '18'}});
        fireEvent.change(screen.getByRole('textbox', {name: 'Додаткова примітка'}), {
            target: {value: 'Повторна перевірка'}
        });
        fireEvent.click(submitButton());

        await waitFor(() => expect((submitButton() as HTMLButtonElement).disabled).toBe(false));
        expect(quantityInput().value).toBe('18');
        expect((screen.getByRole('textbox', {name: 'Додаткова примітка'}) as HTMLInputElement).value)
            .toBe('Повторна перевірка');

        fireEvent.click(submitButton());
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
        expect(quantityInput().value).toBe('18');
    });
});
