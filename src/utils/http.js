import axios from 'axios'

const http = axios.create({
    //VPS
    baseURL: 'http://localhost:8080/api/v1/',
    timeout: 10000, // 10s
    headers: {
        "Content-Type": "application/json",
    }
})

http.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);   
})

export { http }