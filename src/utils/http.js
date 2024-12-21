import axios from 'axios'

const http = axios.create({
    //VPS
    baseURL: 'http://chauhuydien.id.vn/api/v1/',

    //baseURL: 'http://localhost:8080/api/v1/',

    timeout: 20000, // 10s
    headers: {
        "Content-Type": "application/json",
    }
})

// gắn token vào header để xác thực người dùng
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