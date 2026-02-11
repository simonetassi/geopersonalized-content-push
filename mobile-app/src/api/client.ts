import axios from 'axios';

// const API_URL = 'http://192.168.1.248:3000'; // for local execution
const API_URL = 'http://192.168.49.2/api'; // for minikube execution

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
