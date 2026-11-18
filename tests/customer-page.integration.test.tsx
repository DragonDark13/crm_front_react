import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerPage from '../src/components/pages/CustomerPage';
import { ICustomerDetails } from '../src/utils/types';
import { useCustomers } from '../src/components/Provider/CustomerContext';
import { useSnackbarMessage } from '../src/components/Provider/SnackbarMessageContext';
import { useAuth } from '../src/components/context/AuthContext';
import { deleteCustomerData, updateCustomerData } from '../src/api/_customer';

const mocks = vi.hoisted(() => ({
    showSnackbarMessage: vi.fn(),
    createCustomerFunc: vi.fn(),
    fetchGetAllCustomersFunc: vi.fn(),
    updateCustomerData: vi.fn(),
    deleteCustomerData: vi.fn()
}));

vi.mock('../src/components/Provider/CustomerContext', () => ({
    useCustomers: vi.fn()
}));

vi.mock('../src/components/Provider/SnackbarMessageContext', () => ({
    useSnackbarMessage: vi.fn()
}));

vi.mock('../src/components/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../src/api/_customer', () => ({
    createCustomer: vi.fn(),
    deleteCustomerData: mocks.deleteCustomerData,
    fetchCustomerDetails: vi.fn(),
    fetchGetAllCustomers: vi.fn(),
    updateCustomerData: mocks.updateCustomerData
}));

vi.mock('../src/components/Buttons/AddButton', () => ({
    default: ({ onClick, text }: { onClick: () => void; text: string }) =>
        <button onClick={onClick}>{text}</button>
}));

const customer = {
    id: 7,
    name: 'Олена Коваленко',
    email: 'olena@example.com',
    phone_number: '+380501112233',
    address: 'Харків'
} as ICustomerDetails;

const renderCustomerPage = () => {
    vi.mocked(useCustomers).mockReturnValue({
        customers: [customer],
        fetchGetAllCustomersFunc: mocks.fetchGetAllCustomersFunc,
        createCustomerFunc: mocks.createCustomerFunc
    } as ReturnType<typeof useCustomers>);
    vi.mocked(useSnackbarMessage).mockReturnValue({
        showSnackbarMessage: mocks.showSnackbarMessage
    });
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as ReturnType<typeof useAuth>);

    return render(<CustomerPage />);
};

describe('CustomerPage CRUD integration', () => {
    beforeEach(() => {
        mocks.showSnackbarMessage.mockReset();
        mocks.createCustomerFunc.mockReset();
        mocks.fetchGetAllCustomersFunc.mockReset().mockResolvedValue(true);
        mocks.updateCustomerData.mockReset();
        mocks.deleteCustomerData.mockReset();
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('keeps the create dialog open and displays an error when customer creation fails', async () => {
        mocks.createCustomerFunc.mockRejectedValueOnce(new Error('HTTP 400: invalid customer'));
        renderCustomerPage();

        fireEvent.click(screen.getByRole('button', { name: 'Додати нового Кліента' }));
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getAllByRole('textbox')[0], { target: { value: 'Новий клієнт' } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Створити' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            expect.stringContaining('Error creating customer: HTTP 400: invalid customer'),
            'error'
        ));
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith(
            expect.stringContaining('successfully'),
            'success'
        );
    });

    it('closes the create dialog after successful creation', async () => {
        mocks.createCustomerFunc.mockResolvedValueOnce(undefined);
        renderCustomerPage();

        fireEvent.click(screen.getByRole('button', { name: 'Додати нового Кліента' }));
        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getAllByRole('textbox')[0], { target: { value: 'Новий клієнт' } });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Створити' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('keeps the edit dialog open and displays an error when update fails', async () => {
        mocks.updateCustomerData.mockRejectedValueOnce(new Error('HTTP 403: forbidden'));
        renderCustomerPage();

        const customerRow = screen.getByText(customer.name).closest('tr');
        fireEvent.click(within(customerRow as HTMLElement).getAllByRole('button')[1]);
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Error updating customer: HTTP 403: forbidden',
            'error'
        ));
        expect(screen.getByRole('dialog')).toBeTruthy();
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith(
            'Customer updated successfully!',
            'success'
        );
    });

    it('closes the edit dialog after a successful update and warns when list refresh fails', async () => {
        mocks.updateCustomerData.mockResolvedValueOnce({ success: true });
        mocks.fetchGetAllCustomersFunc.mockResolvedValueOnce(false);
        renderCustomerPage();

        const customerRow = screen.getByText(customer.name).closest('tr');
        fireEvent.click(within(customerRow as HTMLElement).getAllByRole('button')[1]);
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Зберегти' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Customer updated successfully!',
            'success'
        ));
        expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Customer was updated, but the customer list could not be refreshed.',
            'warning'
        );
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('displays an error and never a success message when customer deletion fails', async () => {
        mocks.deleteCustomerData.mockRejectedValueOnce(new Error('HTTP 500: server error'));
        renderCustomerPage();

        const customerRow = screen.getByText(customer.name).closest('tr');
        fireEvent.click(within(customerRow as HTMLElement).getAllByRole('button')[2]);
        const dialog = screen.getByRole('dialog');
        fireEvent.click(within(dialog).getByRole('button', { name: 'Видалити' }));

        await waitFor(() => expect(mocks.showSnackbarMessage).toHaveBeenCalledWith(
            'Error deleting customer: HTTP 500: server error',
            'error'
        ));
        expect(mocks.showSnackbarMessage).not.toHaveBeenCalledWith(
            'Клієнта успішно видалено!',
            'success'
        );
    });
});
