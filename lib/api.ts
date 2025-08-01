// API client for CTF Platform Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  score: number;
  solved_challenges: string[];
  created_at: string;
  last_login?: string;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  intro?: string;
  play_instructions?: string;
  points: number;
  difficulty: string;
  is_active: boolean;
  frontend_hint?: string;
  frontend_config: Record<string, any>;
  created_at: string;
  solve_count: number;
  is_solved?: boolean;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  flag?: string;
  points_earned?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  solved_challenges: number;
  progress_percentage: number;
  is_current_user: boolean;
}

// Admin API interfaces
interface AdminUser extends User {
  progress?: any;
}

interface AdminChallenge extends Challenge {
  backend_config?: Record<string, any>;
}

// API Client Class
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      // Check for both token keys since admin login page uses 'token' but API client initially used 'auth_token'
      this.token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      // If found token with old key, standardize to use 'token' key for future consistency
      if (!localStorage.getItem('token') && localStorage.getItem('auth_token')) {
        localStorage.setItem('token', localStorage.getItem('auth_token')!);
      }
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isPublicEndpoint: boolean = false
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`API Request to: ${url}`);
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Environment API URL: ${process.env.NEXT_PUBLIC_API_URL || 'not set'}`); 
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };
    
    console.log('Request config:', { 
      method: options.method || 'GET',
      headers: this.getHeaders(),
    });

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // If auth error on public endpoint, retry without token
        if (isPublicEndpoint && response.status === 401 && this.token) {
          // Remove Authorization header and retry without token
          const publicConfig = { ...config };
          if (publicConfig.headers && 'Authorization' in publicConfig.headers) {
            const { Authorization, ...rest } = publicConfig.headers as Record<string, string>;
            publicConfig.headers = rest;
          }
          
          const retryResponse = await fetch(url, publicConfig);
          if (retryResponse.ok) {
            return retryResponse.json();
          }
          
          const retryErrorData = await retryResponse.json().catch(() => ({}));
          throw new Error(retryErrorData.detail || `HTTP error! status: ${retryResponse.status}`);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (isPublicEndpoint) {
        // For public endpoints, if any error occurs with auth, try once without the token
        const publicConfig = { ...config };
        if (publicConfig.headers) {
          delete (publicConfig.headers as any).Authorization;
        }
        
        try {
          const retryResponse = await fetch(url, publicConfig);
          if (retryResponse.ok) {
            return retryResponse.json();
          }
          
          const retryErrorData = await retryResponse.json().catch(() => ({}));
          throw new Error(retryErrorData.detail || `HTTP error! status: ${retryResponse.status}`);
        } catch (retryError) {
          throw retryError;
        }
      }
      
      throw error;
    }
  }

  // Authentication
  async register(userData: {
    email: string;
    username: string;
    password?: string;
  }): Promise<User> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ access_token: string; token_type: string }> {
    const response = await this.request<{ access_token: string; token_type: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    
    // Store token
    this.token = response.access_token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.access_token);
      // For backward compatibility
      localStorage.setItem('auth_token', response.access_token);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async verifyToken(): Promise<{ valid: boolean; user_id: string; role: string }> {
    return this.request<{ valid: boolean; user_id: string; role: string }>('/auth/verify-token');
  }

  logout(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_token');
    }
  }

  // Challenges
  async getChallenges(filters?: {
    category?: string;
    difficulty?: string;
  }): Promise<Challenge[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    
    const queryString = params.toString();
    const endpoint = `/challenges/${queryString ? `?${queryString}` : ''}`;
    
    // Mark this as a public endpoint that can be accessed without authentication
    return this.request<Challenge[]>(endpoint, {}, true);
  }

  async getChallenge(id: string): Promise<Challenge> {
    return this.request<Challenge>(`/challenges/${id}`);
  }

  async submitChallenge(
    challengeId: string,
    submissionData: Record<string, any>
  ): Promise<SubmissionResult> {
    return this.request<SubmissionResult>(`/challenges/${challengeId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        challenge_id: challengeId,
        submission_data: submissionData,
      }),
    });
  }

  async getChallengeCategories(): Promise<{ categories: string[] }> {
    return this.request<{ categories: string[] }>('/challenges/categories/list');
  }

  async getChallengeDifficulties(): Promise<{ difficulties: string[] }> {
    return this.request<{ difficulties: string[] }>('/challenges/difficulties/list');
  }

  // Leaderboard
  async getLeaderboard(limit: number = 50): Promise<{
    leaderboard: LeaderboardEntry[];
    total_users: number;
    current_user_rank?: number;
  }> {
    return this.request<{
      leaderboard: LeaderboardEntry[];
      total_users: number;
      current_user_rank?: number;
    }>(`/leaderboard/?limit=${limit}`);
  }

  async getUserProgress(): Promise<{
    user_id: string;
    total_challenges: number;
    solved_challenges: number;
    total_score: number;
    progress_percentage: number;
  }> {
    return this.request('/leaderboard/progress');
  }

  // Ads
  async getAds(position?: string): Promise<Array<{
    position: string;
    content: string;
    ad_id: string;
  }>> {
    const endpoint = position ? `/ads/?position=${position}` : '/ads/';
    return this.request(endpoint);
  }

  async trackAdClick(adId: string): Promise<{ message: string }> {
    return this.request(`/ads/click/${adId}`, {
      method: 'POST',
    });
  }

  // Analytics
  async trackPageView(page: string): Promise<{ message: string }> {
    return this.request('/analytics/visits', {
      method: 'POST',
      body: JSON.stringify({
        page,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        ip: 'client' // Will be detected by backend
      })
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string }> {
    return this.request<{ status: string; database: string }>('/health');
  }

  // Admin API Methods
  async getAdminUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/admin/users');
  }
  
  async getAdminChallenges(): Promise<AdminChallenge[]> {
    return this.request<AdminChallenge[]>('/admin/challenges');
  }
  
  async getAdminChallenge(id: string): Promise<AdminChallenge> {
    return this.request<AdminChallenge>(`/admin/challenges/${id}`);
  }
  
  async updateAdminChallenge(id: string, challengeData: Partial<Challenge>): Promise<AdminChallenge> {
    return this.request<AdminChallenge>(`/admin/challenges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(challengeData),
    });
  }
  
  async createAdminChallenge(challengeData: Partial<Challenge>): Promise<AdminChallenge> {
    return this.request<AdminChallenge>('/admin/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  }
  
  async deleteAdminChallenge(id: string): Promise<{ message: string }> {
    return this.request(`/admin/challenges/${id}`, {
      method: 'DELETE',
    });
  }
  
  async getAdminAds(): Promise<Array<{
    position: string;
    content: string;
    ad_id: string;
  }>> {
    return this.request('/ads/admin/list');
  }
  
  async updateAdminAd(id: string, adData: any): Promise<{ message: string }> {
    return this.request(`/ads/admin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adData),
    });
  }
  
  async createAdminAd(adData: { position: string; content: string }): Promise<{ message: string }> {
    // Backend expects query parameters, not a JSON body
    const params = new URLSearchParams({
      position: adData.position,
      content: adData.content
    }).toString();
    
    return this.request(`/ads/admin/create?${params}`, {
      method: 'POST',
      // No body needed as we're using query parameters
    });
  }
  
  async deleteAdminAd(id: string): Promise<{ message: string }> {
    return this.request(`/ads/admin/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for convenience
export const register = (userData: { email: string; username: string; password: string }) => 
  apiClient.register(userData);

export const login = (credentials: { email: string; password: string }) => 
  apiClient.login(credentials);

export const getCurrentUser = () => apiClient.getCurrentUser();

export const verifyToken = () => apiClient.verifyToken();

export const logout = () => apiClient.logout();

export const getChallenges = (filters?: { category?: string; difficulty?: string }) => 
  apiClient.getChallenges(filters);

export const getChallenge = (id: string) => apiClient.getChallenge(id);

export const submitChallenge = (challengeId: string, submissionData: Record<string, any>) => 
  apiClient.submitChallenge(challengeId, submissionData);

export const getChallengeCategories = () => apiClient.getChallengeCategories();

export const getChallengeDifficulties = () => apiClient.getChallengeDifficulties();

export const getLeaderboard = (limit?: number) => apiClient.getLeaderboard(limit);

export const getUserProgress = () => apiClient.getUserProgress();

export const getAds = (position?: string) => apiClient.getAds(position);

export const trackAdClick = (adId: string) => apiClient.trackAdClick(adId);

export const trackPageView = (page: string) => apiClient.trackPageView(page);

export const healthCheck = () => apiClient.healthCheck();

// Admin API exports
export const getAdminUsers = () => apiClient.getAdminUsers();
export const getAdminChallenges = () => apiClient.getAdminChallenges();
export const getAdminChallenge = (id: string) => apiClient.getAdminChallenge(id);
export const updateAdminChallenge = (id: string, data: Partial<Challenge>) => apiClient.updateAdminChallenge(id, data);
export const createAdminChallenge = (data: Partial<Challenge>) => apiClient.createAdminChallenge(data);
export const deleteAdminChallenge = (id: string) => apiClient.deleteAdminChallenge(id);
export const getAdminAds = () => apiClient.getAdminAds();
export const updateAdminAd = (id: string, data: any) => apiClient.updateAdminAd(id, data);
export const createAdminAd = (data: any) => apiClient.createAdminAd(data);
export const deleteAdminAd = (id: string) => apiClient.deleteAdminAd(id);
