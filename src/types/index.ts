// Authenticatie types
export interface User {
  username: string;
  isAuthenticated: boolean;
}

// Gezinslid types
export interface FamilyMember {
  id: string;
  name: string;
  type: 'child' | 'parent' | 'grandparent' | 'babysitter';
  birthDate?: string;
  color: string; // Voor kalender filtering
}

// Kalender types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  participants: string[]; // FamilyMember IDs
  type: 'appointment' | 'activity' | 'meal' | 'sleepover' | 'task';
  location?: string;
}

// Boodschappen types
export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  inStock: boolean;
  isCompleted: boolean;
  addedDate: string;
  completedDate?: string;
}

export interface ShoppingCategory {
  id: string;
  name: string;
  color: string;
}

// Maaltijd types
export interface Meal {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dish: string;
  location: 'home' | 'restaurant' | 'school' | 'work' | 'other';
  locationDetails?: string;
  participants: string[]; // FamilyMember IDs
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
  };
}

// Logeren types
export interface Sleepover {
  id: string;
  childId: string; // FamilyMember ID
  date: string;
  location: string;
  hostName: string;
  notes?: string;
  pickupTime?: string;
}

// Taken types
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string[]; // FamilyMember IDs
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  categories: string[];
  date?: string;
  order?: number;
  createdDate: string;
  completedDate?: string;
}

// App state types
export interface AppState {
  user: User | null;
  familyMembers: FamilyMember[];
  calendarEvents: CalendarEvent[];
  shoppingItems: ShoppingItem[];
  shoppingCategories: ShoppingCategory[];
  meals: Meal[];
  sleepovers: Sleepover[];
  tasks: Task[];
}
