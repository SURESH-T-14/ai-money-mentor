import axios from 'axios';

const api = axios.create({
  // We hardcode the local URL for now, as per the fix.
  // The 'process.env.REACT_APP_API_URL' is for deployment.
  baseURL: 'http://localhost:5000/api', // Your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add the token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;