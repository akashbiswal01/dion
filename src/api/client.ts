import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL_KEY = '@api_base_url';
export const DEFAULT_BASE_URL = 'https://regn.diongroup.in'; // Default for Android emulator

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const isAxiosError = axios.isAxiosError;

export const setBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

export const getBaseUrl = (): string => {
  if (apiClient.defaults.baseURL && apiClient.defaults.baseURL.includes('192.168.1.8')) {
    apiClient.defaults.baseURL = DEFAULT_BASE_URL;
  }
  return apiClient.defaults.baseURL || DEFAULT_BASE_URL;
};

export const initApiClient = async () => {
  try {
    let savedUrl = await AsyncStorage.getItem(API_BASE_URL_KEY);
    if (savedUrl && savedUrl.includes('192.168.1.8')) {
      savedUrl = DEFAULT_BASE_URL;
      await AsyncStorage.setItem(API_BASE_URL_KEY, DEFAULT_BASE_URL);
      console.log('Migrated stale API URL 192.168.1.8 to:', DEFAULT_BASE_URL);
    }

    if (savedUrl) {
      setBaseUrl(savedUrl);
      console.log('API Client initialized with URL:', savedUrl);
    } else {
      console.log('No saved API URL found, using default:', DEFAULT_BASE_URL);
    }
  } catch (error) {
    console.error('Error initializing API client:', error);
  }
};

// Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token && config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore storage error if unlinked in dev
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor if needed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);
