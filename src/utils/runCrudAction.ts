export interface CrudActionCallbacks<T> {
    onSuccess: (result: T) => void;
    onError: (error: unknown) => void;
    onRefreshError: () => void;
}

export const runCrudAction = async <T>(
    operation: () => Promise<T>,
    refresh: () => Promise<boolean | void>,
    callbacks: CrudActionCallbacks<T>
): Promise<void> => {
    let result: T;

    try {
        result = await operation();
    } catch (error) {
        callbacks.onError(error);
        return;
    }

    callbacks.onSuccess(result);

    try {
        const refreshed = await refresh();
        if (refreshed === false) {
            callbacks.onRefreshError();
        }
    } catch {
        callbacks.onRefreshError();
    }
};
