import axios from 'axios';

// The centralized backend URL (local or network IP if running on a separate machine)
const API_URL = 'http://localhost:5001/api';

const instance = axios.create({
  baseURL: API_URL,
});

// Inject the JWT token into every request automatically
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Add global logout on 401 unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default instance;
