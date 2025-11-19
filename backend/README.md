# Gezin App Backend API

FastAPI backend voor de Gezin App die data opslaat in JSON files.

## Installatie

```bash
cd backend
pip install -r requirements.txt
```

## Starten

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

Of gebruik:
```bash
cd backend
python main.py
```

## API Documentatie

Na het starten van de server, ga naar:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### Family Members
- GET `/api/family-members` - Alle gezinsleden
- GET `/api/family-members/{id}` - Specifiek gezinslid
- POST `/api/family-members` - Nieuw gezinslid
- PUT `/api/family-members/{id}` - Update gezinslid
- DELETE `/api/family-members/{id}` - Verwijder gezinslid

### Calendar Events
- GET `/api/calendar-events` - Alle kalender events
- POST `/api/calendar-events` - Nieuw event
- PUT `/api/calendar-events/{id}` - Update event
- DELETE `/api/calendar-events/{id}` - Verwijder event

### Shopping
- GET `/api/shopping-items` - Alle boodschappen
- GET `/api/shopping-categories` - Alle categorieën
- POST `/api/shopping-items` - Nieuw item
- PUT `/api/shopping-items/{id}` - Update item
- DELETE `/api/shopping-items/{id}` - Verwijder item

### Meals
- GET `/api/meals` - Alle maaltijden
- POST `/api/meals` - Nieuwe maaltijd
- PUT `/api/meals/{id}` - Update maaltijd
- DELETE `/api/meals/{id}` - Verwijder maaltijd

### Sleepovers
- GET `/api/sleepovers` - Alle logeerpartijtjes
- POST `/api/sleepovers` - Nieuw logeerpartijtje
- PUT `/api/sleepovers/{id}` - Update logeerpartijtje
- DELETE `/api/sleepovers/{id}` - Verwijder logeerpartijtje

### Tasks
- GET `/api/tasks` - Alle taken
- POST `/api/tasks` - Nieuwe taak
- PUT `/api/tasks/{id}` - Update taak
- DELETE `/api/tasks/{id}` - Verwijder taak

## Data Opslag

Alle data wordt opgeslagen in JSON files in de `data/` folder:
- `family-members.json`
- `calendar-events.json`
- `shopping-items.json`
- `shopping-categories.json`
- `meals.json`
- `sleepovers.json`
- `tasks.json`




