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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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




