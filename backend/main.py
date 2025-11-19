from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import os
from dotenv import load_dotenv

from models import (
    FamilyMember, CalendarEvent, ShoppingCategory, ShoppingItem,
    Meal, Sleepover, Task
)
from file_storage import FileStorage

# Load environment variables
load_dotenv()

app = FastAPI(title="Gezin App API", version="1.0.0")

# CORS configuration - allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize file storages
family_storage = FileStorage("family-members.json")
calendar_storage = FileStorage("calendar-events.json")
shopping_items_storage = FileStorage("shopping-items.json")
shopping_categories_storage = FileStorage("shopping-categories.json")
meals_storage = FileStorage("meals.json")
sleepovers_storage = FileStorage("sleepovers.json")
tasks_storage = FileStorage("tasks.json")

# ============================================================================
# FAMILY MEMBERS ENDPOINTS
# ============================================================================

@app.get("/api/family-members", response_model=List[FamilyMember])
def get_family_members():
    """Get all family members"""
    return family_storage.read_all()

@app.get("/api/family-members/{member_id}", response_model=FamilyMember)
def get_family_member(member_id: str):
    """Get a specific family member"""
    member = family_storage.find_by_id(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member

@app.post("/api/family-members", response_model=FamilyMember)
def create_family_member(member: FamilyMember):
    """Create a new family member"""
    return family_storage.create(member.model_dump())

@app.put("/api/family-members/{member_id}", response_model=FamilyMember)
def update_family_member(member_id: str, member: FamilyMember):
    """Update a family member"""
    updated = family_storage.update(member_id, member.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Family member not found")
    return updated

@app.delete("/api/family-members/{member_id}")
def delete_family_member(member_id: str):
    """Delete a family member"""
    if not family_storage.delete(member_id):
        raise HTTPException(status_code=404, detail="Family member not found")
    return {"message": "Family member deleted"}

# ============================================================================
# CALENDAR EVENTS ENDPOINTS
# ============================================================================

@app.get("/api/calendar-events", response_model=List[CalendarEvent])
def get_calendar_events():
    """Get all calendar events"""
    return calendar_storage.read_all()

@app.get("/api/calendar-events/{event_id}", response_model=CalendarEvent)
def get_calendar_event(event_id: str):
    """Get a specific calendar event"""
    event = calendar_storage.find_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return event

@app.post("/api/calendar-events", response_model=CalendarEvent)
def create_calendar_event(event: CalendarEvent):
    """Create a new calendar event"""
    return calendar_storage.create(event.model_dump())

@app.put("/api/calendar-events/{event_id}", response_model=CalendarEvent)
def update_calendar_event(event_id: str, event: CalendarEvent):
    """Update a calendar event"""
    updated = calendar_storage.update(event_id, event.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return updated

@app.delete("/api/calendar-events/{event_id}")
def delete_calendar_event(event_id: str):
    """Delete a calendar event"""
    if not calendar_storage.delete(event_id):
        raise HTTPException(status_code=404, detail="Calendar event not found")
    return {"message": "Calendar event deleted"}

# ============================================================================
# SHOPPING CATEGORIES ENDPOINTS
# ============================================================================

@app.get("/api/shopping-categories", response_model=List[ShoppingCategory])
def get_shopping_categories():
    """Get all shopping categories"""
    return shopping_categories_storage.read_all()

@app.post("/api/shopping-categories", response_model=ShoppingCategory)
def create_shopping_category(category: ShoppingCategory):
    """Create a new shopping category"""
    return shopping_categories_storage.create(category.model_dump())

# ============================================================================
# SHOPPING ITEMS ENDPOINTS
# ============================================================================

@app.get("/api/shopping-items", response_model=List[ShoppingItem])
def get_shopping_items():
    """Get all shopping items"""
    return shopping_items_storage.read_all()

@app.get("/api/shopping-items/{item_id}", response_model=ShoppingItem)
def get_shopping_item(item_id: str):
    """Get a specific shopping item"""
    item = shopping_items_storage.find_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    return item

@app.post("/api/shopping-items", response_model=ShoppingItem)
def create_shopping_item(item: ShoppingItem):
    """Create a new shopping item"""
    return shopping_items_storage.create(item.model_dump())

@app.put("/api/shopping-items/{item_id}", response_model=ShoppingItem)
def update_shopping_item(item_id: str, item: ShoppingItem):
    """Update a shopping item"""
    updated = shopping_items_storage.update(item_id, item.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    return updated

@app.delete("/api/shopping-items/{item_id}")
def delete_shopping_item(item_id: str):
    """Delete a shopping item"""
    if not shopping_items_storage.delete(item_id):
        raise HTTPException(status_code=404, detail="Shopping item not found")
    return {"message": "Shopping item deleted"}

# ============================================================================
# MEALS ENDPOINTS
# ============================================================================

@app.get("/api/meals", response_model=List[Meal])
def get_meals():
    """Get all meals"""
    return meals_storage.read_all()

@app.get("/api/meals/{meal_id}", response_model=Meal)
def get_meal(meal_id: str):
    """Get a specific meal"""
    meal = meals_storage.find_by_id(meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal

@app.post("/api/meals", response_model=Meal)
def create_meal(meal: Meal):
    """Create a new meal"""
    return meals_storage.create(meal.model_dump())

@app.put("/api/meals/{meal_id}", response_model=Meal)
def update_meal(meal_id: str, meal: Meal):
    """Update a meal"""
    updated = meals_storage.update(meal_id, meal.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Meal not found")
    return updated

@app.delete("/api/meals/{meal_id}")
def delete_meal(meal_id: str):
    """Delete a meal"""
    if not meals_storage.delete(meal_id):
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"message": "Meal deleted"}

# ============================================================================
# SLEEPOVERS ENDPOINTS
# ============================================================================

@app.get("/api/sleepovers", response_model=List[Sleepover])
def get_sleepovers():
    """Get all sleepovers"""
    return sleepovers_storage.read_all()

@app.get("/api/sleepovers/{sleepover_id}", response_model=Sleepover)
def get_sleepover(sleepover_id: str):
    """Get a specific sleepover"""
    sleepover = sleepovers_storage.find_by_id(sleepover_id)
    if not sleepover:
        raise HTTPException(status_code=404, detail="Sleepover not found")
    return sleepover

@app.post("/api/sleepovers", response_model=Sleepover)
def create_sleepover(sleepover: Sleepover):
    """Create a new sleepover"""
    return sleepovers_storage.create(sleepover.model_dump())

@app.put("/api/sleepovers/{sleepover_id}", response_model=Sleepover)
def update_sleepover(sleepover_id: str, sleepover: Sleepover):
    """Update a sleepover"""
    updated = sleepovers_storage.update(sleepover_id, sleepover.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Sleepover not found")
    return updated

@app.delete("/api/sleepovers/{sleepover_id}")
def delete_sleepover(sleepover_id: str):
    """Delete a sleepover"""
    if not sleepovers_storage.delete(sleepover_id):
        raise HTTPException(status_code=404, detail="Sleepover not found")
    return {"message": "Sleepover deleted"}

# ============================================================================
# TASKS ENDPOINTS
# ============================================================================

@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    """Get all tasks"""
    return tasks_storage.read_all()

@app.get("/api/tasks/{task_id}", response_model=Task)
def get_task(task_id: str):
    """Get a specific task"""
    task = tasks_storage.find_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/api/tasks", response_model=Task)
def create_task(task: Task):
    """Create a new task"""
    return tasks_storage.create(task.model_dump())

@app.put("/api/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, task: Task):
    """Update a task"""
    updated = tasks_storage.update(task_id, task.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    """Delete a task"""
    if not tasks_storage.delete(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted"}

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Gezin App API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




