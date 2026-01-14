import axios from 'axios';

const API_BASE_URL = 'https://trca8esu3j.execute-api.eu-west-2.amazonaws.com/production';
const CITY_API_BASE_URL = 'https://0ovja4ep62.execute-api.eu-west-2.amazonaws.com/production';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,  // Use environment variable for API key
  },
  timeout: 10000,                    // Request timeout in ms
  responseType: 'json',            // Response type
});

// City API client for city search
const cityApiClient = axios.create({
  baseURL: CITY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  },
  timeout: 10000,
  responseType: 'json',
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

// Map tour types to Google Places search queries
const tourTypeQueries = {
  history: 'historical sites monuments landmarks',
  art: 'art museum gallery',
  architecture: 'architecture buildings landmarks',
  nature: 'park garden nature reserve',
  food: 'restaurant cafe local food',
  culture: 'cultural center theater museum'
};

export default {
  // Search for a city by name
  getCityByName(cityName) {
    return cityApiClient.get('/getCityByName', {
      params: { cityName }
    });
  },

  // Get tour types/categories
  gettourTypes() {
    return apiClient.get('/tourTypes');
  },

  // Get suggested stops for a city based on tour type
  // Returns stops that can be displayed on the map
  getCityStops(stopCity, tourType) {
    const query = tourTypeQueries[tourType] || tourType;
    return apiClient.get('/cityStops', {
      params: {
        stopCity,
        tourType,
        query
      }
    });
  },

  // Create a tour with selected stops
  // Calls POST /cityStops to save the tour and get routing
  createCityTour({ locations, stopsArray, tourType, tourCity }) {
    return apiClient.post('/cityStops', null, {
      params: {
        locations,        // Semicolon-separated coordinates: "lat,lng;lat,lng;..."
        stopsArray,       // Comma-separated stop IDs: "stop1,stop2,stop3"
        tourType,
        tourCity
      }
    });
  }
};