import { getData, insertData, updateData, deleteData } from './supabaseApi';
import { 
  FamilyMember, 
  CalendarEvent, 
  ShoppingItem, 
  ShoppingCategory, 
  Meal, 
  Sleepover, 
  Task 
} from '../types';



// ============================================================================
// FAMILY MEMBERS API
// ============================================================================

export const familyMembersApi = {
  getAll: () => getData('family_members'),
  create: (data: FamilyMember) => insertData('family_members', data),
  update: (id: string, values: any) => updateData('family_members', id, values),
  delete: (id: string) => deleteData('family_members', id),
};

// ============================================================================
// CALENDAR EVENTS API
// ============================================================================

export const calendarEventsApi = {
  getAll: () => getData('calendar_events'),
  create: (data: CalendarEvent) => insertData('calendar_events', data),
  update: (id: string, values: any) => updateData('calendar_events', id, values),
  delete: (id: string) => deleteData('calendar_events', id),
};

// ============================================================================
// SHOPPING CATEGORIES API
// ============================================================================

export const shoppingCategoriesApi = {
  getAll: () => getData('shopping_categories'),
  create: (data: ShoppingCategory) => insertData('shopping_categories', data),
  update: (id: string, values: any) => updateData('shopping_categories', id, values),
  delete: (id: string) => deleteData('shopping_categories', id),
};

// ============================================================================
// SHOPPING ITEMS API
// ============================================================================

export const shoppingItemsApi = {
  getAll: () => getData('shopping_items'),
  create: (data: ShoppingItem) => insertData('shopping_items', data),
  update: (id: string, values: any) => updateData('shopping_items', id, values),
  delete: (id: string) => deleteData('shopping_items', id),
};

// ============================================================================
// MEALS API
// ============================================================================

export const mealsApi = {
  getAll: () => getData('meals'),
  create: (data: Meal) => insertData('meals', data),
  update: (id: string, values: any) => updateData('meals', id, values),
  delete: (id: string) => deleteData('meals', id),
};

// ============================================================================
// SLEEPOVERS API
// ============================================================================

export const sleepoversApi = {
  getAll: () => getData('sleepovers'),
  create: (data: Sleepover) => insertData('sleepovers', data),
  update: (id: string, values: any) => updateData('sleepovers', id, values),
  delete: (id: string) => deleteData('sleepovers', id),
};

// ============================================================================
// TASKS API
// ============================================================================

export const tasksApi = {
  getAll: () => getData('tasks'),
  create: (data: Task) => insertData('tasks', data),
  update: (id: string, values: any) => updateData('tasks', id, values),
  delete: (id: string) => deleteData('tasks', id),
};






