import { useState, useEffect } from 'react';
import { 
  FamilyMember, 
  CalendarEvent, 
  ShoppingItem, 
  Meal, 
  Sleepover, 
  Task 
} from '../types';
import {
  familyMembersApi,
  calendarEventsApi,
  shoppingItemsApi,
  mealsApi,
  sleepoversApi,
  tasksApi
} from '../services/api';

export const useAppData = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [sleepovers, setSleepovers] = useState<Sleepover[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        familyRes,
        calendarRes,
        shoppingItemsRes,
        mealsRes,
        sleepoversRes,
        tasksRes
      ] = await Promise.all([
        familyMembersApi.getAll(),
        calendarEventsApi.getAll(),
        shoppingItemsApi.getAll(),
        mealsApi.getAll(),
        sleepoversApi.getAll(),
        tasksApi.getAll()
      ]);

      setFamilyMembers(familyRes);
      setCalendarEvents(calendarRes);
      setShoppingItems(shoppingItemsRes);
      setMeals(mealsRes);
      setSleepovers(sleepoversRes);
      setTasks(tasksRes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FAMILY MEMBERS
  // ============================================================================

  const addFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    try {
      const newMember: FamilyMember = {
        ...member,
        id: Date.now().toString()
      };
      const response = await familyMembersApi.create(newMember);
      if (response) setFamilyMembers(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    try {
      const existing = familyMembers.find(m => m.id === id);
      if (!existing) return;
      
      const updated = { ...existing, ...updates };
      const response = await familyMembersApi.update(id, updated);
      if (response) {
        setFamilyMembers(prev => prev.map(member => 
          member.id === id ? response : member
        ));
      }
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  };

  const deleteFamilyMember = async (id: string) => {
    try {
      await familyMembersApi.delete(id);
      setFamilyMembers(prev => prev.filter(member => member.id !== id));
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  };

  // ============================================================================
  // CALENDAR EVENTS
  // ============================================================================

  const addCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent: CalendarEvent = {
        ...event,
        id: Date.now().toString()
      };
      const response = await calendarEventsApi.create(newEvent);
      if (response) setCalendarEvents(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const existing = calendarEvents.find(e => e.id === id);
      if (!existing) return;
      
      const updated = { ...existing, ...updates };
      const response = await calendarEventsApi.update(id, updated);
      if (response) {
        setCalendarEvents(prev => prev.map(event => 
          event.id === id ? response : event
        ));
      }
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    try {
      await calendarEventsApi.delete(id);
      setCalendarEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  };

  // ============================================================================
  // SHOPPING ITEMS
  // ============================================================================

  const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'addeddate'>) => {
    try {
      const newItem: ShoppingItem = {
        ...item,
        id: Date.now().toString(),
        addeddate: new Date().toISOString()
      };
      const response = await shoppingItemsApi.create(newItem);
      if (response) setShoppingItems(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error adding shopping item:', error);
      throw error;
    }
  };

  const updateShoppingItem = async (id: string, updates: Partial<ShoppingItem>) => {
    try {
      const existing = shoppingItems.find(i => i.id === id);
      if (!existing) return;
      
      const updatedItem = { ...existing, ...updates };
      if (updates.iscompleted && !existing.iscompleted) {
        updatedItem.completeddate = new Date().toISOString();
      } else if (updates.iscompleted === false) {
        updatedItem.completeddate = undefined;
      }
      
      await shoppingItemsApi.update(id, updatedItem);
      setShoppingItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
    } catch (error) {
      console.error('Error updating shopping item:', error);
      throw error;
    }
  };

  const deleteShoppingItem = async (id: string) => {
    try {
      await shoppingItemsApi.delete(id);
      setShoppingItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      throw error;
    }
  };

  // ============================================================================
  // SHOPPING CATEGORIES
  // ============================================================================
  // Shopping categories are now hardcoded in ShoppingPage.tsx

  // ============================================================================
  // MEALS
  // ============================================================================

  const addMeal = async (meal: Omit<Meal, 'id'>) => {
    try {
      const newMeal: Meal = {
        ...meal,
        id: Date.now().toString()
      };
      const response = await mealsApi.create(newMeal);
      if (response) setMeals(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    try {
      const existing = meals.find(m => m.id === id);
      if (!existing) return;
      
      const updated = { ...existing, ...updates };
      const response = await mealsApi.update(id, updated);
      if (response) {
        setMeals(prev => prev.map(meal => 
          meal.id === id ? response : meal
        ));
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await mealsApi.delete(id);
      setMeals(prev => prev.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  };

  // ============================================================================
  // SLEEPOVERS
  // ============================================================================

  const addSleepover = async (sleepover: Omit<Sleepover, 'id'>) => {
    try {
      const newSleepover: Sleepover = {
        ...sleepover,
        id: Date.now().toString()
      };
      const response = await sleepoversApi.create(newSleepover);
      if (response) setSleepovers(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error adding sleepover:', error);
      throw error;
    }
  };

  const updateSleepover = async (id: string, updates: Partial<Sleepover>) => {
    try {
      const existing = sleepovers.find(s => s.id === id);
      if (!existing) return;
      
      const updated = { ...existing, ...updates };
      const response = await sleepoversApi.update(id, updated);
      if (response) {
        setSleepovers(prev => prev.map(sleepover => 
          sleepover.id === id ? response : sleepover
        ));
      }
    } catch (error) {
      console.error('Error updating sleepover:', error);
      throw error;
    }
  };

  const deleteSleepover = async (id: string) => {
    try {
      await sleepoversApi.delete(id);
      setSleepovers(prev => prev.filter(sleepover => sleepover.id !== id));
    } catch (error) {
      console.error('Error deleting sleepover:', error);
      throw error;
    }
  };

  // ============================================================================
  // TASKS
  // ============================================================================

  const addTask = async (task: Omit<Task, 'id' | 'createddate'>) => {
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createddate: new Date().toISOString()
      };
      const response = await tasksApi.create(newTask);
      if (response) setTasks(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const existing = tasks.find(t => t.id === id);
      if (!existing) return;
      
      const updatedTask = { ...existing, ...updates };
      if (updates.status === 'completed' && existing.status !== 'completed') {
        updatedTask.completeddate = new Date().toISOString();
      } else if (updates.status !== 'completed') {
        updatedTask.completeddate = undefined;
      }
      
      const response = await tasksApi.update(id, updatedTask);
      if (response) {
        setTasks(prev => prev.map(task => 
          task.id === id ? response : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return {
    // Data
    familyMembers,
    calendarEvents,
    shoppingItems,
    meals,
    sleepovers,
    tasks,
    loading,
    
    // Family Members
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    
    // Calendar Events
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    
    // Shopping Items
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    
    // Meals
    addMeal,
    updateMeal,
    deleteMeal,
    
    // Sleepovers
    addSleepover,
    updateSleepover,
    deleteSleepover,
    
    // Tasks
    addTask,
    updateTask,
    deleteTask
  };
};
