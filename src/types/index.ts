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
  birthdate?: string;
  color: string; // Voor kalender filtering
}

// Kalender types
export interface CalendarEvent {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  participants: string[]; // FamilyMember IDs (stored as jsonb)
  location?: string;
}

// Boodschappen types
export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
  instock?: boolean;
  iscompleted: boolean;
  addeddate: string;
  completeddate?: string;
  notes?: string;
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
  mealtype: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dish: string;
  location: 'home' | 'restaurant' | 'school' | 'work' | 'other';
  locationdetails?: string;
  participants: string[];
  recurring?: string; // stored as JSON string in database
}

// Logeren types
export interface Sleepover {
  id: string;
  childid: string; // FamilyMember ID
  date: string;
  location?: string; // Contains locationtype as text: "Opa/Oma Asten", "Opa/Oma Heusden", "Oppas", or custom text
  hostname?: string;
  notes?: string;
  pickuptime?: string;
}

// Taken types
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedto?: string[]; // FamilyMember IDs
  duedate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  categories: string[];
  date?: string;
  order?: number;
  createddate: string;
  completeddate?: string;
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
