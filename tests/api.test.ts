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
        vi.useRealTimers();
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

    it('retries a temporary GET failure and returns the successful response', async () => {
        vi.useFakeTimers();
        const error = createHttpError(503);
        const getSpy = vi.spyOn(axiosInstance, 'get')
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({data: [{id: 1}]} as never);

        const request = fetchResource('/test');
        await vi.advanceTimersByTimeAsync(300);

        await expect(request).resolves.toEqual([{id: 1}]);
        expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('does not retry a client error for GET requests', async () => {
        const error = createHttpError(404);
        const getSpy = vi.spyOn(axiosInstance, 'get').mockRejectedValue(error);

        await expect(fetchResource('/test')).rejects.toBe(error);
        expect(getSpy).toHaveBeenCalledTimes(1);
    });

    it('does not retry POST mutations', async () => {
        const error = createHttpError(503);
        const postSpy = vi.spyOn(axiosInstance, 'post').mockRejectedValue(error);

        await expect(postResource('/test', {})).rejects.toBe(error);
        expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('does not retry a GET request when its signal is already aborted', async () => {
        const controller = new AbortController();
        controller.abort();
        const error = createHttpError(503);
        const getSpy = vi.spyOn(axiosInstance, 'get').mockRejectedValue(error);

        await expect(fetchResource('/test', {signal: controller.signal})).rejects.toBe(error);
        expect(getSpy).toHaveBeenCalledTimes(1);
    });
});
