import axios from 'axios';

const API_BASE_URL = 'https://trca8esu3j.execute-api.eu-west-2.amazonaws.com/production';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,  // Use environment variable for API key
  },
  timeout: 10000,                    // Request timeout in ms
  responseType: 'json',            // Response type
});

// Add request interceptor for auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if you're using Cognito or similar
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  // Example API methods
  gettourTypes() {
    return apiClient.get('/tourTypes');
  },
  
  // getItem(id) {
  //   return apiClient.get(`/items/${id}`);
  // },
  
  // createItem(data) {
  //   return apiClient.post('/items', data);
  // },
  
  // updateItem(id, data) {
  //   return apiClient.put(`/items/${id}`, data);
  // },
  
  // deleteItem(id) {
  //   return apiClient.delete(`/items/${id}`);
  // },
};