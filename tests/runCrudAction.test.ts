import { describe, expect, it, vi } from 'vitest';
import { runCrudAction } from '../src/utils/runCrudAction';

describe('runCrudAction', () => {
    it.each([400, 401, 403, 404, 500])('does not report success when CRUD returns HTTP %s', async status => {
        const error = Object.assign(new Error(`HTTP ${status}`), { response: { status } });
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const onRefreshError = vi.fn();
        const refresh = vi.fn().mockResolvedValue(true);

        await runCrudAction(
            () => Promise.reject(error),
            refresh,
            { onSuccess, onError, onRefreshError }
        );

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(error);
        expect(onRefreshError).not.toHaveBeenCalled();
        expect(refresh).not.toHaveBeenCalled();
    });

    it('reports successful CRUD separately when the following GET fails', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const onRefreshError = vi.fn();

        await runCrudAction(
            () => Promise.resolve({ id: 1 }),
            () => Promise.resolve(false),
            { onSuccess, onError, onRefreshError }
        );

        expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
        expect(onError).not.toHaveBeenCalled();
        expect(onRefreshError).toHaveBeenCalledOnce();
    });

    it('reports successful CRUD and successful refresh', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const onRefreshError = vi.fn();

        await runCrudAction(
            () => Promise.resolve({ id: 1 }),
            () => Promise.resolve(true),
            { onSuccess, onError, onRefreshError }
        );

        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onError).not.toHaveBeenCalled();
        expect(onRefreshError).not.toHaveBeenCalled();
    });

    it('handles a rejected refresh without reclassifying the CRUD operation as failed', async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const onRefreshError = vi.fn();

        await runCrudAction(
            () => Promise.resolve({ id: 1 }),
            () => Promise.reject(new Error('GET failed')),
            { onSuccess, onError, onRefreshError }
        );

        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onError).not.toHaveBeenCalled();
        expect(onRefreshError).toHaveBeenCalledOnce();
    });
});
