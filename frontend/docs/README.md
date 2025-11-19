# Gezin App - Frontend Documentatie

## Overzicht
Een complete React TypeScript applicatie voor gezinsbeheer met alle functionaliteiten die je nodig hebt om je gezinsleven te organiseren.

## ✅ Geïmplementeerde Functionaliteiten

### 🔐 Authenticatie
- Username/password login uit .env file
- Sessie management met localStorage
- Automatische redirect naar login bij ongeautoriseerde toegang

### 👨‍👩‍👧‍👦 Gezinsconfiguratie
- Beheer van gezinsleden (kinderen, ouders, opa/oma, oppas)
- Kleurcodering voor kalender filtering
- Geboortedatum tracking
- Categorisering per type gezinslid

### 📅 Kalender Systeem
- Weekoverzicht en maandkalender
- Filtering per gezinslid met kleurcodering
- Verschillende event types (afspraak, activiteit, maaltijd, logeren, taak)
- Locatie en deelnemers per event
- Tijd en beschrijving opties

### 🛒 Boodschappenlijst
- Categorisering van producten
- Voorraad tracking (op/voorradig)
- Afvinken van gekochte items
- Hoeveelheid en eenheid per product
- Statistieken en filters
- Bulk acties voor afgevinkte items

### 🍽️ Maaltijdplanning
- Weekoverzicht van alle maaltijden
- Verschillende maaltijdtypes (ontbijt, lunch, avondeten, tussendoortje)
- Locatie tracking (thuis, restaurant, school, etc.)
- Deelnemers per maaltijd
- Terugkerende maaltijden (dagelijks, wekelijks, maandelijks)
- Lijst- en weekweergave

### 🛏️ Logeren Tracking
- Bijhouden waar kinderen logeren
- Gastheer/vrouw informatie
- Ophaaltijd planning
- Status tracking (komend/afgelopen)
- Notities per logeerpartijtje
- Filtering per kind en periode

### ✅ Takenlijst
- Prioriteit levels (laag, gemiddeld, hoog)
- Status tracking (te doen, bezig, voltooid)
- Toewijzing aan gezinsleden
- Deadline management
- Categorisering van taken
- Verlopen taken highlighting
- Uitgebreide filter opties

### 📱 Mobile Responsive Design
- Optimaal voor telefoon gebruik
- Touch-friendly interface elementen
- Responsive grid layouts
- Mobile-first navigation
- Optimale viewport instellingen

## Technische Stack
- React 18 met TypeScript
- React Router voor navigatie
- Axios voor API calls
- React Calendar voor kalender functionaliteit
- Lucide React voor iconen
- Date-fns voor datum utilities
- CSS Modules voor styling

## Project Structuur
```
src/
├── components/          # Herbruikbare componenten
├── pages/              # Pagina componenten
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definities
├── utils/              # Utility functies
├── styles/             # CSS bestanden
└── data/               # Mock data en localStorage helpers
```

## Authenticatie
- Username en password worden opgeslagen in .env file
- Eenvoudige session-based authenticatie
- Automatische redirect naar login bij ongeautoriseerde toegang

## Data Opslag
- LocalStorage voor client-side data persistentie
- JSON structuur voor alle data
- Automatische backup en restore functionaliteit

## Mobile Optimalisatie
- Responsive design met CSS Grid en Flexbox
- Touch-friendly interface elementen
- Optimale viewport instellingen
- Progressive Web App ready

## Ontwikkeling
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

## 🚀 Installatie en Setup

### Optie 1: Docker (Aanbevolen) 🐳

#### Vereisten
- Docker Desktop voor Windows
- Docker Compose (inbegrepen bij Docker Desktop)

#### Installatie met Docker
1. Zorg dat Docker Desktop actief is
2. Dubbelklik op `docker-start.bat` in de hoofdmap van het project

De applicatie wordt automatisch gebouwd en gestart:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentatie**: http://localhost:8000/docs

#### Docker Commando's (Windows)
```bash
docker-start.bat       # Start de applicatie
docker-stop.bat        # Stop de applicatie
docker-logs.bat        # Bekijk logs van alle containers
docker-rebuild.bat     # Herbouw containers (na code wijzigingen)
```

#### Docker Voordelen
- ✅ Geen lokale Node.js of Python installatie nodig
- ✅ Consistente omgeving op alle systemen
- ✅ Eenvoudig te starten en stoppen
- ✅ Data blijft behouden in `./data` directory
- ✅ Automatische restart bij crashes

### Optie 2: Lokale Ontwikkeling

#### Vereisten
- Node.js 16+ 
- npm of yarn
- Python 3.11+

#### Installatie Frontend
```bash
cd gezin-app
npm install
```

#### Installatie Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Configuratie
Pas de .env file aan voor custom authenticatie:
```
REACT_APP_USERNAME=jouw_username
REACT_APP_PASSWORD=jouw_password
```

#### Development Servers Starten
```bash
# Frontend (terminal 1)
npm start

# Backend (terminal 2)
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

De applicatie is dan beschikbaar op:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 🎯 Gebruik

### Eerste Keer Opstarten
1. Log in met de credentials uit je .env file
2. Ga naar "Gezin" om je gezinsleden toe te voegen
3. Begin met het plannen van je eerste activiteiten in de kalender
4. Voeg boodschappen toe aan je lijstje
5. Plan maaltijden voor de komende week

### Tips voor Optimaal Gebruik
- **Kleurcodering**: Geef elk gezinslid een unieke kleur voor overzichtelijke kalender filtering
- **Categorieën**: Gebruik de voorgedefinieerde categorieën voor boodschappen en taken
- **Terugkerende Items**: Gebruik de herhaalfunctie voor wekelijkse maaltijden
- **Mobile**: De app werkt perfect op je telefoon - voeg een bookmark toe aan je homescreen
- **Filters**: Gebruik de uitgebreide filteropties om snel te vinden wat je zoekt

## 🔧 Aanpassingen

### Nieuwe Boodschappencategorieën
Bewerk `src/hooks/useAppData.ts` om nieuwe categorieën toe te voegen aan `defaultShoppingCategories`.

### Nieuwe Taakcategorieën  
Bewerk `src/pages/TasksPage.tsx` om nieuwe categorieën toe te voegen aan de `categories` array.

### Styling Aanpassingen
Alle styling staat in de `src/styles/` directory. Elke pagina heeft zijn eigen CSS bestand.

## 📊 Data Opslag
- Alle data wordt lokaal opgeslagen in localStorage
- Geen externe database vereist
- Data blijft behouden tussen sessies
- Automatische synchronisatie tussen browser tabs

## 🐛 Troubleshooting

### Docker Problemen
- **Docker start niet**: Controleer of Docker Desktop actief is
- **Port al in gebruik**: Stop andere applicaties op poort 3000 of 8000
- **Containers starten niet**: Gebruik `docker-rebuild.bat` voor een schone rebuild
- **Data verdwijnt**: Controleer of de `./data` directory bestaat en gemount is
- **Logs bekijken**: Gebruik `docker-logs.bat` om foutmeldingen te zien

### Login Problemen
- Controleer of de .env file correct is ingesteld
- Zorg dat REACT_APP_ prefix wordt gebruikt
- Herstart de development server na .env wijzigingen
- Bij Docker: herbouw de containers met `docker-rebuild.bat`

### Data Verlies
- Data wordt opgeslagen in de `./data` directory (Docker) of localStorage (lokaal)
- Bij Docker: data blijft behouden in `./data` zelfs na container herstart
- Bij lokaal: open Developer Tools → Application → Local Storage
- Backup je data door de bestanden in `./data` te kopiëren

### Performance
- De app is geoptimaliseerd voor snelheid
- Bij grote hoeveelheden data kunnen filters helpen
- Verwijder oude voltooide taken/events periodiek

## 🔄 Updates en Uitbreidingen

De applicatie is modulair opgezet en kan eenvoudig worden uitgebreid met:
- Nieuwe pagina's in `src/pages/`
- Nieuwe componenten in `src/components/`
- Nieuwe data types in `src/types/`
- Nieuwe hooks in `src/hooks/`

## 📱 Progressive Web App
De applicatie is PWA-ready en kan worden geïnstalleerd op mobiele apparaten voor een native app ervaring.

## Configuratie
Standaard login credentials (pas aan in .env):
```
REACT_APP_USERNAME=admin
REACT_APP_PASSWORD=gezin2024
```
