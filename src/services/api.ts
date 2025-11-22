import axios from 'axios';
import { 
  FamilyMember, 
  CalendarEvent, 
  ShoppingItem, 
  ShoppingCategory, 
  Meal, 
  Sleepover, 
  Task 
} from '../types';

// Resolve base URL for API requests:
// - If `REACT_APP_API_URL` is set (recommended for multi-device access), use it.
// - Otherwise fall back to the current page's hostname with port 8000.
// Note: `localhost` in the browser always refers to the client machine. When
// accessing the app from another device you must set `REACT_APP_API_URL`
// to the backend server's reachable IP/hostname (for example: http://192.168.1.100:8000).
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000`;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// FAMILY MEMBERS API
// ============================================================================

export const familyMembersApi = {
  getAll: () => api.get<FamilyMember[]>('/api/family-members'),
  getById: (id: string) => api.get<FamilyMember>(`/api/family-members/${id}`),
  create: (data: FamilyMember) => api.post<FamilyMember>('/api/family-members', data),
  update: (id: string, data: FamilyMember) => api.put<FamilyMember>(`/api/family-members/${id}`, data),
  delete: (id: string) => api.delete(`/api/family-members/${id}`),
};

// ============================================================================
// CALENDAR EVENTS API
// ============================================================================

export const calendarEventsApi = {
  getAll: () => api.get<CalendarEvent[]>('/api/calendar-events'),
  getById: (id: string) => api.get<CalendarEvent>(`/api/calendar-events/${id}`),
  create: (data: CalendarEvent) => api.post<CalendarEvent>('/api/calendar-events', data),
  update: (id: string, data: CalendarEvent) => api.put<CalendarEvent>(`/api/calendar-events/${id}`, data),
  delete: (id: string) => api.delete(`/api/calendar-events/${id}`),
};

// ============================================================================
// SHOPPING CATEGORIES API
// ============================================================================

export const shoppingCategoriesApi = {
  getAll: () => api.get<ShoppingCategory[]>('/api/shopping-categories'),
  create: (data: ShoppingCategory) => api.post<ShoppingCategory>('/api/shopping-categories', data),
};

// ============================================================================
// SHOPPING ITEMS API
// ============================================================================

export const shoppingItemsApi = {
  getAll: () => api.get<ShoppingItem[]>('/api/shopping-items'),
  getById: (id: string) => api.get<ShoppingItem>(`/api/shopping-items/${id}`),
  create: (data: ShoppingItem) => api.post<ShoppingItem>('/api/shopping-items', data),
  update: (id: string, data: ShoppingItem) => api.put<ShoppingItem>(`/api/shopping-items/${id}`, data),
  delete: (id: string) => api.delete(`/api/shopping-items/${id}`),
};

// ============================================================================
// MEALS API
// ============================================================================

export const mealsApi = {
  getAll: () => api.get<Meal[]>('/api/meals'),
  getById: (id: string) => api.get<Meal>(`/api/meals/${id}`),
  create: (data: Meal) => api.post<Meal>('/api/meals', data),
  update: (id: string, data: Meal) => api.put<Meal>(`/api/meals/${id}`, data),
  delete: (id: string) => api.delete(`/api/meals/${id}`),
};

// ============================================================================
// SLEEPOVERS API
// ============================================================================

export const sleepoversApi = {
  getAll: () => api.get<Sleepover[]>('/api/sleepovers'),
  getById: (id: string) => api.get<Sleepover>(`/api/sleepovers/${id}`),
  create: (data: Sleepover) => api.post<Sleepover>('/api/sleepovers', data),
  update: (id: string, data: Sleepover) => api.put<Sleepover>(`/api/sleepovers/${id}`, data),
  delete: (id: string) => api.delete(`/api/sleepovers/${id}`),
};

// ============================================================================
// TASKS API
// ============================================================================

export const tasksApi = {
  getAll: () => api.get<Task[]>('/api/tasks'),
  getById: (id: string) => api.get<Task>(`/api/tasks/${id}`),
  create: (data: Task) => api.post<Task>('/api/tasks', data),
  update: (id: string, data: Task) => api.put<Task>(`/api/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/api/tasks/${id}`),
};

export default api;

// Health check helper — returns true when backend responds
export type HealthResult = {
  ok: boolean;
  reason?: string;
};

// Health check helper — returns ok=true when backend responds, otherwise includes a reason string
export const healthCheck = async (): Promise<HealthResult> => {
  try {
    const res = await api.get('/');
    if (res.status === 200) return { ok: true };
    return { ok: false, reason: `Server responded with status ${res.status} ${res.statusText}` };
  } catch (err: any) {
    // axios error handling
    if (err.response) {
      // Server responded with a status outside 2xx
      return { ok: false, reason: `Server error ${err.response.status} ${err.response.statusText}` };
    }
    if (err.request) {
      // Request made but no response received. Could be network issue or CORS blocking the response.
      // Browser CORS errors surface as a "Network Error" with no response available.
      const msg = err.message || '';
      if (msg.toLowerCase().includes('timeout')) {
        return { ok: false, reason: 'Request timed out. Backend may be down or unreachable.' };
      }
      if (msg.toLowerCase().includes('network')) {
        return {
          ok: false,
          reason:
            'Network Error: could not reach backend. This can mean the server is down, the IP/port is unreachable, or the browser blocked the response because of CORS. Check backend, firewall and CORS settings.',
        };
      }
      return {
        ok: false,
        reason:
          'No response received from backend. Possible causes: server is not running, firewall blocking, or CORS preventing the browser from seeing the response.',
      };
    }
    // Something happened setting up the request
    return { ok: false, reason: `Request error: ${err.message || String(err)}` };
  }
};




