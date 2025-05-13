// Операції з користувачем
import {API_ENDPOINTS, axiosInstance, handleError, postResource} from "./api";

export const loginUser = (username: string, password: string): Promise<string> => {
    return postResource<{ token: string }>(API_ENDPOINTS.LOGIN, {username, password}).then(data => data.token);
};

export const logoutUser = (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) {
        return Promise.reject("No token found");
    }
    console.log("Token:", token);
    return axiosInstance.post(API_ENDPOINTS.LOGOUT, {}, {
        headers: {'Authorization': `Bearer ${token}`},
    }).then(() => {
        localStorage.removeItem('token');  // Clear token from localStorage
        console.log("User logged out successfully");
    }).catch(handleError);
};