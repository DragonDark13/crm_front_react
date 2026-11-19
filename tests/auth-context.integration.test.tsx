import React from 'react';
import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {axiosInstance} from '../src/api/api';
import {AuthProvider, useAuth} from '../src/components/context/AuthContext';

vi.mock('../src/api/api', () => ({
    axiosInstance: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

const AuthHarness = () => {
    const {token, roles, isAuthenticated, authReady, login, logout} = useAuth();

    return (
        <div>
            <span data-testid="token">{token ?? ''}</span>
            <span data-testid="roles">{roles.join(',')}</span>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <span data-testid="ready">{String(authReady)}</span>
            <button onClick={() => void login('new-access-token').catch(() => undefined)}>Login context</button>
            <button onClick={() => void logout()}>Logout context</button>
        </div>
    );
};

describe('AuthContext API integration contract', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('marks an empty session ready without calling the backend', async () => {
        render(<AuthProvider><AuthHarness /></AuthProvider>);

        await waitFor(() => expect(screen.getByTestId('ready').textContent).toBe('true'));
        expect(axiosInstance.get).not.toHaveBeenCalled();
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });

    it('restores a stored token only after /me confirms its roles', async () => {
        localStorage.setItem('token', 'stored-access-token');
        vi.mocked(axiosInstance.get).mockResolvedValueOnce({
            data: {id: 7, username: 'manager', roles: ['manager']}
        } as never);

        render(<AuthProvider><AuthHarness /></AuthProvider>);

        await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));
        expect(axiosInstance.get).toHaveBeenCalledWith('/me', {
            headers: {Authorization: 'Bearer stored-access-token'}
        });
        expect(screen.getByTestId('roles').textContent).toBe('manager');
        expect(screen.getByTestId('token').textContent).toBe('stored-access-token');
    });

    it('clears a stored token when /me rejects it', async () => {
        localStorage.setItem('token', 'revoked-access-token');
        vi.mocked(axiosInstance.get).mockRejectedValueOnce(new Error('Unauthorized'));

        render(<AuthProvider><AuthHarness /></AuthProvider>);

        await waitFor(() => expect(screen.getByTestId('ready').textContent).toBe('true'));
        expect(localStorage.getItem('token')).toBeNull();
        expect(screen.getByTestId('token').textContent).toBe('');
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });

    it('accepts login only after the backend /me contract returns roles', async () => {
        vi.mocked(axiosInstance.get).mockResolvedValueOnce({
            data: {id: 8, username: 'guest', roles: ['guest']}
        } as never);

        render(<AuthProvider><AuthHarness /></AuthProvider>);
        fireEvent.click(screen.getByRole('button', {name: 'Login context'}));

        await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));
        expect(axiosInstance.get).toHaveBeenCalledWith('/me', {
            headers: {Authorization: 'Bearer new-access-token'}
        });
        expect(localStorage.getItem('token')).toBe('new-access-token');
        expect(screen.getByTestId('roles').textContent).toBe('guest');
    });

    it('does not keep a token when backend validation after login fails', async () => {
        vi.mocked(axiosInstance.get).mockRejectedValueOnce(new Error('Unauthorized'));

        render(<AuthProvider><AuthHarness /></AuthProvider>);
        fireEvent.click(screen.getByRole('button', {name: 'Login context'}));

        await waitFor(() => expect(screen.getByTestId('ready').textContent).toBe('true'));
        expect(localStorage.getItem('token')).toBeNull();
        expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });

    it('calls backend logout and clears the local session', async () => {
        localStorage.setItem('token', 'active-access-token');
        vi.mocked(axiosInstance.get).mockResolvedValueOnce({
            data: {id: 9, username: 'manager', roles: ['manager']}
        } as never);
        vi.mocked(axiosInstance.post).mockResolvedValueOnce({data: {message: 'Logout successful'}} as never);

        render(<AuthProvider><AuthHarness /></AuthProvider>);
        await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

        fireEvent.click(screen.getByRole('button', {name: 'Logout context'}));

        await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('false'));
        expect(axiosInstance.post).toHaveBeenCalledWith('/logout', {});
        expect(localStorage.getItem('token')).toBeNull();
        expect(screen.getByTestId('roles').textContent).toBe('');
    });
});
