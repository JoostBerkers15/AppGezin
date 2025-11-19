from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FamilyMember(BaseModel):
    id: str
    name: str
    type: str  # 'parent', 'child', 'grandparent', 'babysitter'
    color: str
    birthDate: Optional[str] = None

class CalendarEvent(BaseModel):
    id: str
    title: str
    date: str
    time: Optional[str] = None
    type: str  # 'appointment', 'activity', 'meal', 'sleepover', 'task'
    participants: List[str] = []
    location: Optional[str] = None
    description: Optional[str] = None

class ShoppingCategory(BaseModel):
    id: str
    name: str
    color: str

class ShoppingItem(BaseModel):
    id: str
    name: str
    category: str
    quantity: int
    unit: str
    isCompleted: bool = False
    addedDate: str
    completedDate: Optional[str] = None
    inStock: bool = True

class MealRecurring(BaseModel):
    frequency: str  # 'daily', 'weekly', 'monthly'
    endDate: Optional[str] = None

class Meal(BaseModel):
    id: str
    dish: str
    date: str
    mealType: str  # 'breakfast', 'lunch', 'dinner', 'snack'
    location: str  # 'home', 'restaurant', 'school', 'work', 'other'
    locationDetails: Optional[str] = None
    participants: List[str] = []
    recurring: Optional[MealRecurring] = None

class Sleepover(BaseModel):
    id: str
    childId: str
    date: str
    location: str
    hostName: str
    pickupTime: Optional[str] = None
    notes: Optional[str] = None

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    assignedTo: Optional[str] = None
    priority: str  # 'low', 'medium', 'high'
    status: str  # 'pending', 'in_progress', 'completed'
    dueDate: Optional[str] = None
    category: str
    createdDate: str
    completedDate: Optional[str] = None




