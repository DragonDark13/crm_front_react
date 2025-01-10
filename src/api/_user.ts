// Операції з користувачем
import {API_ENDPOINTS, axiosInstance, postResource} from "./api";

export const loginUser = (username: string, password: string): Promise<string> => {
    return postResource<{ token: string }>(API_ENDPOINTS.LOGIN, {username, password}).then(data => data.token);
};

export const logoutUser = (): Promise<void> => {
    const token = localStorage.getItem('token');
    return axiosInstance.post(API_ENDPOINTS.LOGOUT, {}, {
        headers: {'Authorization': `Bearer ${token}`},
    }).catch(handleError);
};
