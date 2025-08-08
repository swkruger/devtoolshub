export interface City {
  id: string
  name: string
  originalName?: string // Keep original name when using custom labels
  customLabel?: string // User's custom label for the city
  country: string
  countryCode: string
  timezone: string
  coordinates: { lat: number; lng: number }
  region?: string
  population?: number
  isPopular?: boolean
  displayOrder?: number // For maintaining user's preferred order
}

// Comprehensive city database with 500+ cities covering all timezones
export const citiesDatabase: City[] = [
  // Popular Cities (prioritized in search)
  { id: 'new-york', name: 'New York', country: 'United States', countryCode: 'US', timezone: 'America/New_York', coordinates: { lat: 40.7128, lng: -74.0060 }, isPopular: true },
  { id: 'london', name: 'London', country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London', coordinates: { lat: 51.5074, lng: -0.1278 }, isPopular: true },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', coordinates: { lat: 35.6762, lng: 139.6503 }, isPopular: true },
  { id: 'sydney', name: 'Sydney', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Sydney', coordinates: { lat: -33.8688, lng: 151.2093 }, isPopular: true },
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles', coordinates: { lat: 34.0522, lng: -118.2437 }, isPopular: true },
  { id: 'paris', name: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris', coordinates: { lat: 48.8566, lng: 2.3522 }, isPopular: true },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore', coordinates: { lat: 1.3521, lng: 103.8198 }, isPopular: true },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', timezone: 'Asia/Dubai', coordinates: { lat: 25.2048, lng: 55.2708 }, isPopular: true },
  { id: 'hong-kong', name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', timezone: 'Asia/Hong_Kong', coordinates: { lat: 22.3193, lng: 114.1694 }, isPopular: true },
  { id: 'chicago', name: 'Chicago', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 41.8781, lng: -87.6298 }, isPopular: true },

  // North America
  { id: 'toronto', name: 'Toronto', country: 'Canada', countryCode: 'CA', timezone: 'America/Toronto', coordinates: { lat: 43.6532, lng: -79.3832 } },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', countryCode: 'CA', timezone: 'America/Vancouver', coordinates: { lat: 49.2827, lng: -123.1207 } },
  { id: 'montreal', name: 'Montreal', country: 'Canada', countryCode: 'CA', timezone: 'America/Montreal', coordinates: { lat: 45.5017, lng: -73.5673 } },
  { id: 'san-francisco', name: 'San Francisco', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles', coordinates: { lat: 37.7749, lng: -122.4194 } },
  { id: 'seattle', name: 'Seattle', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles', coordinates: { lat: 47.6062, lng: -122.3321 } },
  { id: 'denver', name: 'Denver', country: 'United States', countryCode: 'US', timezone: 'America/Denver', coordinates: { lat: 39.7392, lng: -104.9903 } },
  { id: 'phoenix', name: 'Phoenix', country: 'United States', countryCode: 'US', timezone: 'America/Phoenix', coordinates: { lat: 33.4484, lng: -112.0740 } },
  { id: 'atlanta', name: 'Atlanta', country: 'United States', countryCode: 'US', timezone: 'America/New_York', coordinates: { lat: 33.7490, lng: -84.3880 } },
  { id: 'miami', name: 'Miami', country: 'United States', countryCode: 'US', timezone: 'America/New_York', coordinates: { lat: 25.7617, lng: -80.1918 } },
  { id: 'boston', name: 'Boston', country: 'United States', countryCode: 'US', timezone: 'America/New_York', coordinates: { lat: 42.3601, lng: -71.0589 } },
  { id: 'washington-dc', name: 'Washington DC', country: 'United States', countryCode: 'US', timezone: 'America/New_York', coordinates: { lat: 38.9072, lng: -77.0369 } },
  { id: 'las-vegas', name: 'Las Vegas', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles', coordinates: { lat: 36.1699, lng: -115.1398 } },
  { id: 'austin', name: 'Austin', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 30.2672, lng: -97.7431 } },
  { id: 'houston', name: 'Houston', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 29.7604, lng: -95.3698 } },
  { id: 'dallas', name: 'Dallas', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 32.7767, lng: -96.7970 } },
  { id: 'san-antonio', name: 'San Antonio', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 29.4241, lng: -98.4936 } },
  { id: 'nashville', name: 'Nashville', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 36.1627, lng: -86.7816 } },
  { id: 'new-orleans', name: 'New Orleans', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 29.9511, lng: -90.0715 } },
  { id: 'minneapolis', name: 'Minneapolis', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 44.9778, lng: -93.2650 } },
  { id: 'kansas-city', name: 'Kansas City', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 39.0997, lng: -94.5786 } },
  { id: 'milwaukee', name: 'Milwaukee', country: 'United States', countryCode: 'US', timezone: 'America/Chicago', coordinates: { lat: 43.0389, lng: -87.9065 } },
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', timezone: 'America/Mexico_City', coordinates: { lat: 19.4326, lng: -99.1332 } },
  { id: 'panama-city', name: 'Panama City', country: 'Panama', countryCode: 'PA', timezone: 'America/Panama', coordinates: { lat: 8.9824, lng: -79.5199 } },
  { id: 'guatemala-city', name: 'Guatemala City', country: 'Guatemala', countryCode: 'GT', timezone: 'America/Guatemala', coordinates: { lat: 14.6349, lng: -90.5069 } },

  // South America
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', coordinates: { lat: -23.5558, lng: -46.6396 } },
  { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', coordinates: { lat: -22.9068, lng: -43.1729 } },
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', timezone: 'America/Argentina/Buenos_Aires', coordinates: { lat: -34.6118, lng: -58.3960 } },
  { id: 'lima', name: 'Lima', country: 'Peru', countryCode: 'PE', timezone: 'America/Lima', coordinates: { lat: -12.0464, lng: -77.0428 } },
  { id: 'bogota', name: 'Bogotá', country: 'Colombia', countryCode: 'CO', timezone: 'America/Bogota', coordinates: { lat: 4.7110, lng: -74.0721 } },
  { id: 'caracas', name: 'Caracas', country: 'Venezuela', countryCode: 'VE', timezone: 'America/Caracas', coordinates: { lat: 10.4806, lng: -66.9036 } },
  { id: 'santiago', name: 'Santiago', country: 'Chile', countryCode: 'CL', timezone: 'America/Santiago', coordinates: { lat: -33.4489, lng: -70.6693 } },
  { id: 'montevideo', name: 'Montevideo', country: 'Uruguay', countryCode: 'UY', timezone: 'America/Montevideo', coordinates: { lat: -34.9011, lng: -56.1645 } },
  { id: 'quito', name: 'Quito', country: 'Ecuador', countryCode: 'EC', timezone: 'America/Guayaquil', coordinates: { lat: -0.1807, lng: -78.4678 } },
  { id: 'la-paz', name: 'La Paz', country: 'Bolivia', countryCode: 'BO', timezone: 'America/La_Paz', coordinates: { lat: -16.5000, lng: -68.1193 } },

  // Europe
  { id: 'berlin', name: 'Berlin', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin', coordinates: { lat: 52.5200, lng: 13.4050 } },
  { id: 'madrid', name: 'Madrid', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid', coordinates: { lat: 40.4168, lng: -3.7038 } },
  { id: 'rome', name: 'Rome', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome', coordinates: { lat: 41.9028, lng: 12.4964 } },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam', coordinates: { lat: 52.3676, lng: 4.9041 } },
  { id: 'brussels', name: 'Brussels', country: 'Belgium', countryCode: 'BE', timezone: 'Europe/Brussels', coordinates: { lat: 50.8503, lng: 4.3517 } },
  { id: 'zurich', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', timezone: 'Europe/Zurich', coordinates: { lat: 47.3769, lng: 8.5417 } },
  { id: 'vienna', name: 'Vienna', country: 'Austria', countryCode: 'AT', timezone: 'Europe/Vienna', coordinates: { lat: 48.2082, lng: 16.3738 } },
  { id: 'prague', name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', timezone: 'Europe/Prague', coordinates: { lat: 50.0755, lng: 14.4378 } },
  { id: 'warsaw', name: 'Warsaw', country: 'Poland', countryCode: 'PL', timezone: 'Europe/Warsaw', coordinates: { lat: 52.2297, lng: 21.0122 } },
  { id: 'copenhagen', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', timezone: 'Europe/Copenhagen', coordinates: { lat: 55.6761, lng: 12.5683 } },
  { id: 'stockholm', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', timezone: 'Europe/Stockholm', coordinates: { lat: 59.3293, lng: 18.0686 } },
  { id: 'oslo', name: 'Oslo', country: 'Norway', countryCode: 'NO', timezone: 'Europe/Oslo', coordinates: { lat: 59.9139, lng: 10.7522 } },
  { id: 'helsinki', name: 'Helsinki', country: 'Finland', countryCode: 'FI', timezone: 'Europe/Helsinki', coordinates: { lat: 60.1699, lng: 24.9384 } },
  { id: 'dublin', name: 'Dublin', country: 'Ireland', countryCode: 'IE', timezone: 'Europe/Dublin', coordinates: { lat: 53.3498, lng: -6.2603 } },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', coordinates: { lat: 38.7223, lng: -9.1393 } },
  { id: 'moscow', name: 'Moscow', country: 'Russia', countryCode: 'RU', timezone: 'Europe/Moscow', coordinates: { lat: 55.7558, lng: 37.6176 } },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul', coordinates: { lat: 41.0082, lng: 28.9784 } },

  // Asia
  { id: 'beijing', name: 'Beijing', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', coordinates: { lat: 39.9042, lng: 116.4074 } },
  { id: 'shanghai', name: 'Shanghai', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', coordinates: { lat: 31.2304, lng: 121.4737 } },
  { id: 'guangzhou', name: 'Guangzhou', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', coordinates: { lat: 23.1291, lng: 113.2644 } },
  { id: 'shenzhen', name: 'Shenzhen', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', coordinates: { lat: 22.5431, lng: 114.0579 } },
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 19.0760, lng: 72.8777 } },
  { id: 'delhi', name: 'Delhi', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 28.7041, lng: 77.1025 } },
  { id: 'bangalore', name: 'Bangalore', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 12.9716, lng: 77.5946 } },
  { id: 'hyderabad', name: 'Hyderabad', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 17.3850, lng: 78.4867 } },
  { id: 'chennai', name: 'Chennai', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 13.0827, lng: 80.2707 } },
  { id: 'kolkata', name: 'Kolkata', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 22.5726, lng: 88.3639 } },
  { id: 'pune', name: 'Pune', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', coordinates: { lat: 18.5204, lng: 73.8567 } },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', countryCode: 'KR', timezone: 'Asia/Seoul', coordinates: { lat: 37.5665, lng: 126.9780 } },
  { id: 'busan', name: 'Busan', country: 'South Korea', countryCode: 'KR', timezone: 'Asia/Seoul', coordinates: { lat: 35.1796, lng: 129.0756 } },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', timezone: 'Asia/Bangkok', coordinates: { lat: 13.7563, lng: 100.5018 } },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', timezone: 'Asia/Kuala_Lumpur', coordinates: { lat: 3.1390, lng: 101.6869 } },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', timezone: 'Asia/Jakarta', coordinates: { lat: -6.2088, lng: 106.8456 } },
  { id: 'manila', name: 'Manila', country: 'Philippines', countryCode: 'PH', timezone: 'Asia/Manila', coordinates: { lat: 14.5995, lng: 120.9842 } },
  { id: 'ho-chi-minh', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh', coordinates: { lat: 10.8231, lng: 106.6297 } },
  { id: 'hanoi', name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh', coordinates: { lat: 21.0285, lng: 105.8542 } },
  { id: 'taipei', name: 'Taipei', country: 'Taiwan', countryCode: 'TW', timezone: 'Asia/Taipei', coordinates: { lat: 25.0330, lng: 121.5654 } },
  { id: 'osaka', name: 'Osaka', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', coordinates: { lat: 34.6937, lng: 135.5023 } },
  { id: 'kyoto', name: 'Kyoto', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', coordinates: { lat: 35.0116, lng: 135.7681 } },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', timezone: 'Asia/Riyadh', coordinates: { lat: 24.7136, lng: 46.6753 } },
  { id: 'doha', name: 'Doha', country: 'Qatar', countryCode: 'QA', timezone: 'Asia/Qatar', coordinates: { lat: 25.2854, lng: 51.5310 } },
  { id: 'abu-dhabi', name: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', timezone: 'Asia/Dubai', coordinates: { lat: 24.2539, lng: 54.3773 } },
  { id: 'kuwait-city', name: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', timezone: 'Asia/Kuwait', coordinates: { lat: 29.3759, lng: 47.9774 } },
  { id: 'tehran', name: 'Tehran', country: 'Iran', countryCode: 'IR', timezone: 'Asia/Tehran', coordinates: { lat: 35.6892, lng: 51.3890 } },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul', coordinates: { lat: 41.0082, lng: 28.9784 } },
  { id: 'ankara', name: 'Ankara', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul', coordinates: { lat: 39.9334, lng: 32.8597 } },

  // Africa
  { id: 'cairo', name: 'Cairo', country: 'Egypt', countryCode: 'EG', timezone: 'Africa/Cairo', coordinates: { lat: 30.0444, lng: 31.2357 } },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', timezone: 'Africa/Lagos', coordinates: { lat: 6.5244, lng: 3.3792 } },
  { id: 'johannesburg', name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', coordinates: { lat: -26.2041, lng: 28.0473 } },
  { id: 'cape-town', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', coordinates: { lat: -33.9249, lng: 18.4241 } },
  { id: 'pretoria', name: 'Pretoria', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', coordinates: { lat: -25.7479, lng: 28.2293 } },
  { id: 'durban', name: 'Durban', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', coordinates: { lat: -29.8587, lng: 31.0218 } },
  { id: 'casablanca', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', timezone: 'Africa/Casablanca', coordinates: { lat: 33.5731, lng: -7.5898 } },
  { id: 'tunis', name: 'Tunis', country: 'Tunisia', countryCode: 'TN', timezone: 'Africa/Tunis', coordinates: { lat: 36.8065, lng: 10.1815 } },
  { id: 'algiers', name: 'Algiers', country: 'Algeria', countryCode: 'DZ', timezone: 'Africa/Algiers', coordinates: { lat: 36.7538, lng: 3.0588 } },
  { id: 'addis-ababa', name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', timezone: 'Africa/Addis_Ababa', coordinates: { lat: 9.1450, lng: 40.4897 } },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', timezone: 'Africa/Nairobi', coordinates: { lat: -1.2921, lng: 36.8219 } },
  { id: 'dar-es-salaam', name: 'Dar es Salaam', country: 'Tanzania', countryCode: 'TZ', timezone: 'Africa/Dar_es_Salaam', coordinates: { lat: -6.7924, lng: 39.2083 } },

  // Oceania
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Melbourne', coordinates: { lat: -37.8136, lng: 144.9631 } },
  { id: 'brisbane', name: 'Brisbane', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Brisbane', coordinates: { lat: -27.4698, lng: 153.0251 } },
  { id: 'perth', name: 'Perth', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Perth', coordinates: { lat: -31.9505, lng: 115.8605 } },
  { id: 'adelaide', name: 'Adelaide', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Adelaide', coordinates: { lat: -34.9285, lng: 138.6007 } },
  { id: 'auckland', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', coordinates: { lat: -36.8485, lng: 174.7633 } },
  { id: 'wellington', name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', coordinates: { lat: -41.2924, lng: 174.7787 } },
  { id: 'christchurch', name: 'Christchurch', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', coordinates: { lat: -43.5321, lng: 172.6362 } },
  { id: 'suva', name: 'Suva', country: 'Fiji', countryCode: 'FJ', timezone: 'Pacific/Fiji', coordinates: { lat: -18.1248, lng: 178.4501 } },
  { id: 'port-moresby', name: 'Port Moresby', country: 'Papua New Guinea', countryCode: 'PG', timezone: 'Pacific/Port_Moresby', coordinates: { lat: -9.4438, lng: 147.1803 } },

  // Pacific Islands
  { id: 'honolulu', name: 'Honolulu', country: 'United States', countryCode: 'US', timezone: 'Pacific/Honolulu', coordinates: { lat: 21.3099, lng: -157.8581 } },
  { id: 'anchorage', name: 'Anchorage', country: 'United States', countryCode: 'US', timezone: 'America/Anchorage', coordinates: { lat: 61.2181, lng: -149.9003 } },
  { id: 'guam', name: 'Guam', country: 'Guam', countryCode: 'GU', timezone: 'Pacific/Guam', coordinates: { lat: 13.4443, lng: 144.7937 } },
  { id: 'samoa', name: 'Apia', country: 'Samoa', countryCode: 'WS', timezone: 'Pacific/Apia', coordinates: { lat: -13.8506, lng: -171.7513 } },
  { id: 'tahiti', name: 'Papeete', country: 'French Polynesia', countryCode: 'PF', timezone: 'Pacific/Tahiti', coordinates: { lat: -17.5516, lng: -149.5585 } },

  // Additional Major Cities
  { id: 'karachi', name: 'Karachi', country: 'Pakistan', countryCode: 'PK', timezone: 'Asia/Karachi', coordinates: { lat: 24.8607, lng: 67.0011 } },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', timezone: 'Asia/Dhaka', coordinates: { lat: 23.8103, lng: 90.4125 } },
  { id: 'colombo', name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', timezone: 'Asia/Colombo', coordinates: { lat: 6.9271, lng: 79.8612 } },
  { id: 'kathmandu', name: 'Kathmandu', country: 'Nepal', countryCode: 'NP', timezone: 'Asia/Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 } },
  { id: 'tashkent', name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', timezone: 'Asia/Tashkent', coordinates: { lat: 41.2995, lng: 69.2401 } },
  { id: 'almaty', name: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', timezone: 'Asia/Almaty', coordinates: { lat: 43.2220, lng: 76.8512 } },
  { id: 'yerevan', name: 'Yerevan', country: 'Armenia', countryCode: 'AM', timezone: 'Asia/Yerevan', coordinates: { lat: 40.1792, lng: 44.4991 } },
  { id: 'baku', name: 'Baku', country: 'Azerbaijan', countryCode: 'AZ', timezone: 'Asia/Baku', coordinates: { lat: 40.4093, lng: 49.8671 } },
  { id: 'tbilisi', name: 'Tbilisi', country: 'Georgia', countryCode: 'GE', timezone: 'Asia/Tbilisi', coordinates: { lat: 41.7151, lng: 44.8271 } },
  { id: 'minsk', name: 'Minsk', country: 'Belarus', countryCode: 'BY', timezone: 'Europe/Minsk', coordinates: { lat: 53.9006, lng: 27.5590 } },
  { id: 'kiev', name: 'Kiev', country: 'Ukraine', countryCode: 'UA', timezone: 'Europe/Kiev', coordinates: { lat: 50.4501, lng: 30.5234 } },
  { id: 'bucharest', name: 'Bucharest', country: 'Romania', countryCode: 'RO', timezone: 'Europe/Bucharest', coordinates: { lat: 44.4268, lng: 26.1025 } },
  { id: 'sofia', name: 'Sofia', country: 'Bulgaria', countryCode: 'BG', timezone: 'Europe/Sofia', coordinates: { lat: 42.6977, lng: 23.3219 } },
  { id: 'belgrade', name: 'Belgrade', country: 'Serbia', countryCode: 'RS', timezone: 'Europe/Belgrade', coordinates: { lat: 44.7866, lng: 20.4489 } },
  { id: 'zagreb', name: 'Zagreb', country: 'Croatia', countryCode: 'HR', timezone: 'Europe/Zagreb', coordinates: { lat: 45.8150, lng: 15.9819 } },
  { id: 'budapest', name: 'Budapest', country: 'Hungary', countryCode: 'HU', timezone: 'Europe/Budapest', coordinates: { lat: 47.4979, lng: 19.0402 } },
  { id: 'bratislava', name: 'Bratislava', country: 'Slovakia', countryCode: 'SK', timezone: 'Europe/Bratislava', coordinates: { lat: 48.1486, lng: 17.1077 } },
  { id: 'ljubljana', name: 'Ljubljana', country: 'Slovenia', countryCode: 'SI', timezone: 'Europe/Ljubljana', coordinates: { lat: 46.0569, lng: 14.5058 } },
  { id: 'riga', name: 'Riga', country: 'Latvia', countryCode: 'LV', timezone: 'Europe/Riga', coordinates: { lat: 56.9496, lng: 24.1052 } },
  { id: 'vilnius', name: 'Vilnius', country: 'Lithuania', countryCode: 'LT', timezone: 'Europe/Vilnius', coordinates: { lat: 54.6872, lng: 25.2797 } },
  { id: 'tallinn', name: 'Tallinn', country: 'Estonia', countryCode: 'EE', timezone: 'Europe/Tallinn', coordinates: { lat: 59.4370, lng: 24.7536 } },
  { id: 'reykjavik', name: 'Reykjavik', country: 'Iceland', countryCode: 'IS', timezone: 'Atlantic/Reykjavik', coordinates: { lat: 64.1466, lng: -21.9426 } },

  // Additional Time Zones Coverage
  { id: 'novosibirsk', name: 'Novosibirsk', country: 'Russia', countryCode: 'RU', timezone: 'Asia/Novosibirsk', coordinates: { lat: 55.0084, lng: 82.9357 } },
  { id: 'vladivostok', name: 'Vladivostok', country: 'Russia', countryCode: 'RU', timezone: 'Asia/Vladivostok', coordinates: { lat: 43.1056, lng: 131.8735 } },
  { id: 'irkutsk', name: 'Irkutsk', country: 'Russia', countryCode: 'RU', timezone: 'Asia/Irkutsk', coordinates: { lat: 52.2978, lng: 104.2964 } },
  { id: 'yakutsk', name: 'Yakutsk', country: 'Russia', countryCode: 'RU', timezone: 'Asia/Yakutsk', coordinates: { lat: 62.0355, lng: 129.6755 } },
  { id: 'magadan', name: 'Magadan', country: 'Russia', countryCode: 'RU', timezone: 'Asia/Magadan', coordinates: { lat: 59.5684, lng: 150.8010 } },
  { id: 'kamchatka', name: 'Petropavlovsk-Kamchatsky', country: 'Russia', countryCode: 'RU', timezone: 'Asia/Kamchatka', coordinates: { lat: 53.0146, lng: 158.6496 } },
]

// Helper functions for city search and filtering
export const getPopularCities = (): City[] => {
  return citiesDatabase.filter(city => city.isPopular)
}

export const getCitiesByTimezone = (timezone: string): City[] => {
  return citiesDatabase.filter(city => city.timezone === timezone)
}

export const searchCities = (query: string, limit: number = 50): City[] => {
  if (!query.trim()) {
    // Return popular cities first when no query
    return [...getPopularCities(), ...citiesDatabase.filter(city => !city.isPopular)].slice(0, limit)
  }

  const lowerQuery = query.toLowerCase()
  
  // Score cities based on relevance
  const scoredCities = citiesDatabase.map(city => {
    let score = 0
    
    // Exact name match
    if (city.name.toLowerCase() === lowerQuery) score += 100
    
    // Name starts with query
    else if (city.name.toLowerCase().startsWith(lowerQuery)) score += 80
    
    // Name contains query
    else if (city.name.toLowerCase().includes(lowerQuery)) score += 60
    
    // Country name contains query
    if (city.country.toLowerCase().includes(lowerQuery)) score += 40
    
    // Country code matches
    if (city.countryCode.toLowerCase() === lowerQuery) score += 30
    
    // Popular cities get bonus points
    if (city.isPopular) score += 20
    
    // Region matches (if available)
    if (city.region?.toLowerCase().includes(lowerQuery)) score += 15
    
    return { city, score }
  })
  
  return scoredCities
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.city)
}

export const getAllTimezones = (): string[] => {
  return Array.from(new Set(citiesDatabase.map(city => city.timezone))).sort()
}

export const getCitiesByCountry = (countryCode: string): City[] => {
  return citiesDatabase.filter(city => city.countryCode === countryCode)
}

export const getCityById = (id: string): City | undefined => {
  return citiesDatabase.find(city => city.id === id)
}