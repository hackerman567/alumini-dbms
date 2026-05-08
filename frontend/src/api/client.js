import axios from 'axios';

const client = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'https://alumini-backend-canh.onrender.com') + '/api/v1',
    withCredentials: true
});

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
