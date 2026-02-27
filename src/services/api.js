import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CITY_API_BASE_URL = import.meta.env.VITE_CITY_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,  // Use environment variable for API key
  },
  timeout: 100000,                    // Request timeout in ms
  responseType: 'json',            // Response type
});

// City API client for city search
const cityApiClient = axios.create({
  baseURL: CITY_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  },
  timeout: 100000,
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

  // Get street and city info for address pages
  getStadStraat(stad, straat, provincie) {
    return cityApiClient.get('/stadStraat', {
      params: { stad, straat, provincie }
    });
  },

  // Get tour types/categories
  gettourTypes() {
    return apiClient.get('/tourTypes');
  },

  // Get suggested stops for a city based on tour type
  // Returns stops that can be displayed on the map
  getCityStops(stopCity, tourType) {
    return apiClient.get('/cityStops', {
      params: {
        stopCity,
        tourType
      }
    });
  },

  // Create a tour with selected stops
  // Calls POST /cityStops to save the tour and get routing
  createCityTour({ tourType, prompt, stopCity }) {
    return apiClient.post('/cityStops', null, {
      params: {
        tourType,       // Comma-separated stop IDs: "stop1,stop2,stop3"
        prompt,
        stopCity
      }
    });
  },

  // Generate city stops using AI when no stops are found
  // Calls POST /cityStops with prompt to generate new stops
  generateCityStops({ stopCity, prompt, tourType }) {
    return apiClient.post('/cityStops', null, {
      params: {
        stopCity,
        prompt,
        tourType
      }
    });
  },

  // Generate audio for a stop
  // Calls POST /stopAudio to create audio content for a stop
  generateStopAudio({ stopID, stopCity, stopName, stopType }) {
    return apiClient.post('/stopAudio', null, {
      params: {
        stopID,
        stopCity,
        stopName,
        stopType
      }
    });
  },

  // Submit user feedback for a completed tour
  submitFeedback(feedbackData) {
    return apiClient.post('/feedback', feedbackData);
  },

  // Get testimonials for the landing page
  getTestimonials(limit = 10) {
    return apiClient.get('/feedback', {
      params: { limit }
    });
  },

  // Get enrichment data for a stop from OpenTripMap (wikipedia extract, image, kinds, rate)
  getStopEnrichment({ lat, lng, stopId, stopName }) {
    return apiClient.get('/stopEnrichment', {
      params: { lat, lng, stopId, stopName }
    });
  },

  // Create a Mollie payment for a donation
  createPayment({ amount, tourId, tourCity, redirectUrl }) {
    return apiClient.post('/payment', {
      amount: amount.toFixed(2),
      currency: 'EUR',
      tourId,
      tourCity,
      redirectUrl
    });
  }
};