// Операції з користувачем
import {API_ENDPOINTS, axiosInstance, handleError, postResource} from "./api";

export const loginUser = (username: string, password: string): Promise<string> => {
    return postResource<{ token: string }>(API_ENDPOINTS.LOGIN, {username, password}).then(data => data.token);
};

export const logoutUser = (): Promise<void> => {
    return axiosInstance.post(API_ENDPOINTS.LOGOUT, {})
        .then(() => {
            localStorage.removeItem('token');
        })
        .catch(handleError);
};