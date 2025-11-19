import json
import os
from typing import List, TypeVar, Generic
from pathlib import Path

T = TypeVar('T')

class FileStorage(Generic[T]):
    """Generic file storage for JSON data"""
    
    def __init__(self, filename: str):
        # Data folder is one level up from backend folder
        self.data_dir = Path(__file__).parent.parent / "data"
        self.filepath = self.data_dir / filename
        
        # Ensure data directory exists
        self.data_dir.mkdir(exist_ok=True)
        
        # Ensure file exists
        if not self.filepath.exists():
            self.filepath.write_text("[]")
    
    def read_all(self) -> List[dict]:
        """Read all items from the JSON file"""
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    def write_all(self, data: List[dict]) -> None:
        """Write all items to the JSON file"""
        with open(self.filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def find_by_id(self, item_id: str) -> dict | None:
        """Find an item by ID"""
        items = self.read_all()
        return next((item for item in items if item.get('id') == item_id), None)
    
    def create(self, item: dict) -> dict:
        """Create a new item"""
        items = self.read_all()
        items.append(item)
        self.write_all(items)
        return item
    
    def update(self, item_id: str, updates: dict) -> dict | None:
        """Update an existing item"""
        items = self.read_all()
        for i, item in enumerate(items):
            if item.get('id') == item_id:
                items[i].update(updates)
                self.write_all(items)
                return items[i]
        return None
    
    def delete(self, item_id: str) -> bool:
        """Delete an item by ID"""
        items = self.read_all()
        filtered = [item for item in items if item.get('id') != item_id]
        if len(filtered) < len(items):
            self.write_all(filtered)
            return True
        return False




