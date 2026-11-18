import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance, deleteResource, fetchResource, getApiErrorMessage, postResource, putResource } from '../src/api/api';

const statuses = [400, 401, 403, 404, 500];

const createHttpError = (status: number) => Object.assign(new Error('Request failed'), {
    isAxiosError: true,
    response: {
        status,
        data: { error: `HTTP ${status} error` }
    }
});

describe('CRUD API error handling', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each(statuses)('preserves HTTP %s for GET requests', async status => {
        const error = createHttpError(status);
        vi.spyOn(axiosInstance, 'get').mockRejectedValue(error);

        await expect(fetchResource('/test')).rejects.toBe(error);
        expect(getApiErrorMessage(error)).toBe(`HTTP ${status} error`);
        expect((error as { response: { status: number } }).response.status).toBe(status);
    });

    it.each(statuses)('preserves HTTP %s for POST requests', async status => {
        const error = createHttpError(status);
        vi.spyOn(axiosInstance, 'post').mockRejectedValue(error);

        await expect(postResource('/test', {})).rejects.toBe(error);
        expect(getApiErrorMessage(error)).toBe(`HTTP ${status} error`);
        expect((error as { response: { status: number } }).response.status).toBe(status);
    });

    it.each(statuses)('preserves HTTP %s for PUT requests', async status => {
        const error = createHttpError(status);
        vi.spyOn(axiosInstance, 'put').mockRejectedValue(error);

        await expect(putResource('/test', {})).rejects.toBe(error);
        expect(getApiErrorMessage(error)).toBe(`HTTP ${status} error`);
        expect((error as { response: { status: number } }).response.status).toBe(status);
    });

    it.each(statuses)('preserves HTTP %s for DELETE requests', async status => {
        const error = createHttpError(status);
        vi.spyOn(axiosInstance, 'delete').mockRejectedValue(error);

        await expect(deleteResource('/test')).rejects.toBe(error);
        expect(getApiErrorMessage(error)).toBe(`HTTP ${status} error`);
        expect((error as { response: { status: number } }).response.status).toBe(status);
    });
});
