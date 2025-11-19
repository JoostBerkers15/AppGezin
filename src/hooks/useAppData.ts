import { useState, useEffect } from 'react';
import { 
  FamilyMember, 
  CalendarEvent, 
  ShoppingItem, 
  ShoppingCategory, 
  Meal, 
  Sleepover, 
  Task 
} from '../types';
import {
  familyMembersApi,
  calendarEventsApi,
  shoppingItemsApi,
  shoppingCategoriesApi,
  mealsApi,
  sleepoversApi,
  tasksApi
} from '../services/api';

export const useAppData = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [shoppingCategories, setShoppingCategories] = useState<ShoppingCategory[]>([]);
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
        shoppingCategoriesRes,
        mealsRes,
        sleepoversRes,
        tasksRes
      ] = await Promise.all([
        familyMembersApi.getAll(),
        calendarEventsApi.getAll(),
        shoppingItemsApi.getAll(),
        shoppingCategoriesApi.getAll(),
        mealsApi.getAll(),
        sleepoversApi.getAll(),
        tasksApi.getAll()
      ]);

      setFamilyMembers(familyRes.data);
      setCalendarEvents(calendarRes.data);
      setShoppingItems(shoppingItemsRes.data);
      setShoppingCategories(shoppingCategoriesRes.data);
      setMeals(mealsRes.data);
      setSleepovers(sleepoversRes.data);
      setTasks(tasksRes.data);
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
      setFamilyMembers(prev => [...prev, response.data]);
      return response.data;
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
      await familyMembersApi.update(id, updated);
      setFamilyMembers(prev => prev.map(member => 
        member.id === id ? updated : member
      ));
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
      setCalendarEvents(prev => [...prev, response.data]);
      return response.data;
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
      await calendarEventsApi.update(id, updated);
      setCalendarEvents(prev => prev.map(event => 
        event.id === id ? updated : event
      ));
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

  const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'addedDate'>) => {
    try {
      const newItem: ShoppingItem = {
        ...item,
        id: Date.now().toString(),
        addedDate: new Date().toISOString()
      };
      const response = await shoppingItemsApi.create(newItem);
      setShoppingItems(prev => [...prev, response.data]);
      return response.data;
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
      if (updates.isCompleted && !existing.isCompleted) {
        updatedItem.completedDate = new Date().toISOString();
      } else if (updates.isCompleted === false) {
        updatedItem.completedDate = undefined;
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

  const addShoppingCategory = async (category: Omit<ShoppingCategory, 'id'>) => {
    try {
      const newCategory: ShoppingCategory = {
        ...category,
        id: Date.now().toString()
      };
      const response = await shoppingCategoriesApi.create(newCategory);
      setShoppingCategories(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding shopping category:', error);
      throw error;
    }
  };

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
      setMeals(prev => [...prev, response.data]);
      return response.data;
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
      await mealsApi.update(id, updated);
      setMeals(prev => prev.map(meal => 
        meal.id === id ? updated : meal
      ));
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
      setSleepovers(prev => [...prev, response.data]);
      return response.data;
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
      await sleepoversApi.update(id, updated);
      setSleepovers(prev => prev.map(sleepover => 
        sleepover.id === id ? updated : sleepover
      ));
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

  const addTask = async (task: Omit<Task, 'id' | 'createdDate'>) => {
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdDate: new Date().toISOString()
      };
      const response = await tasksApi.create(newTask);
      setTasks(prev => [...prev, response.data]);
      return response.data;
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
        updatedTask.completedDate = new Date().toISOString();
      } else if (updates.status !== 'completed') {
        updatedTask.completedDate = undefined;
      }
      
      await tasksApi.update(id, updatedTask);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
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
    shoppingCategories,
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
    addShoppingCategory,
    
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
