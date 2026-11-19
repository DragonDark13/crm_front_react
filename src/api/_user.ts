// Операції з користувачем
import {API_ENDPOINTS, postResource} from "./api";
import {LoginResponse} from "./contracts";

export const loginUser = (username: string, password: string): Promise<string> => {
    return postResource<LoginResponse>(API_ENDPOINTS.LOGIN, {username, password}).then(data => data.token);
};

export const logoutUser = (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
        return Promise.reject(new Error("No token found"));
    }
    return postResource<void>(API_ENDPOINTS.LOGOUT, {}).then(() => {
        localStorage.removeItem('token');
    });
};
