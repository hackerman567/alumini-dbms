import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://alumini-backend-canh.onrender.com';
const API_BASE = API_URL + '/api/v1';

const client = axios.create({
    baseURL: API_BASE,
    withCredentials: true
});

export const getBaseURL = () => API_URL;

// Request Interceptor: Add Token from LocalStorage
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle Global Errors (like 401 Unauthorized)
client.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || { error: 'Network Error' });
    }
);

export default client;
