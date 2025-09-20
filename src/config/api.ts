// Configuration de l'URL de l'API
export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// URL complète pour les appels API
export const API_URL: string = `${API_BASE_URL}/api`;

// Export par défaut
const config = {
  BASE_URL: API_BASE_URL,
  API_URL: API_URL,
};

export default config;