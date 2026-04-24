import axios from 'axios';

export const BASE_URL = 'https://mentrix-backend.onrender.com';

export interface User {
  id: string;
  full_name: string;
  email: string;
  name?: string; // Legacy support
  initials?: string;
}

export interface Role {
  role_id: number;
  role_name: string;
  id?: string; // Compatibility
  name?: string; // Compatibility
  description?: string;
  accentColor?: string;
  icon?: string;
}

export interface Institute {
  institute_id: number;
  institute_name: string;
  location: string;
  roles: Role[];
  logo?: string; // Correct field name for backend logo URL
  city?: string; // Compatibility
  state?: string; // Compatibility
  logo_url?: string;
  isVerified?: boolean; // Compatibility
  id?: string; // Standardized ID fallback
  name?: string; // Standardized Name fallback
  institute_type?: string; // e.g. "School", "College", "University"
}

export interface AuthLoginResponse {
  success: boolean;
  data: {
    token: string;
    pre_context_token?: string;
    user: User;
  };
}

export interface UserContextResponse {
  success: boolean;
  data: Institute[];
}

// Create an axios instance with a 10-second timeout for Render cold starts
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Modern API Service for MentrixOS (2-Step Authentication)
 */
export const api = {
  /**
   * STEP 1: Login to get token and user profile
   */
  login: async (email: string, password: string): Promise<AuthLoginResponse> => {
    console.log('--- LOGIN REQUEST ---');
    console.log('URL:', `${BASE_URL}/auth/login`);
    console.log('BODY:', { email, password });

    try {
      const response = await apiClient.post<AuthLoginResponse>('/auth/login', { email, password });
      console.log("SUCCESS:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("ERROR:", error.message);
      console.log("FULL ERROR:", error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Invalid login credentials or no working endpoint');
      } else if (error.request) {
        throw new Error('Network request failed - server may be waking up');
      }
      throw error;
    }
  },

  /**
   * STEP 2: Fetch user context (institutes and roles) using Bearer token
   */
  getMyInstitutesRoles: async (token: string): Promise<UserContextResponse> => {
    console.log('--- CONTEXT REQUEST ---');
    console.log('URL:', `${BASE_URL}/auth/my-institutes-roles`);
    console.log('AUTH: Bearer', token.substring(0, 10) + '...');

    try {
      const response = await apiClient.get<UserContextResponse>('/auth/my-institutes-roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("SUCCESS:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("ERROR:", error.message);
      console.log("FULL ERROR:", error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch user context');
      }
      throw new Error('Network request failed - failed to fetch context');
    }
  },
};
