import axios from 'axios';

// Create an axios instance with only the baseURL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3100/api/v1',
  withCredentials: true,
});

export default axiosInstance;
