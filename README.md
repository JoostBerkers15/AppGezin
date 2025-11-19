# 👨‍👩‍👧‍👦 Gezin App

Een complete webapplicatie voor gezinsbeheer met kalender, boodschappenlijst, maaltijdplanning, logeertracking en takenbeheer.

## 🚀 Snelstart met Docker

### Vereisten
- Docker Desktop voor Windows

### Installatie
1. Start Docker Desktop
2. Dubbelklik op `docker-start.bat`
3. Open je browser op http://localhost:3000

Dat is alles! De applicatie draait nu volledig in Docker containers.

## 📋 Functionaliteiten

- 🔐 **Authenticatie** - Veilige login met sessie management
- 👨‍👩‍👧‍👦 **Gezinsbeheer** - Beheer gezinsleden met kleurcodering
- 📅 **Kalender** - Week- en maandoverzicht met filtering
- 🛒 **Boodschappenlijst** - Categorisering en voorraad tracking
- 🍽️ **Maaltijdplanning** - Weekoverzicht met terugkerende maaltijden
- 🛏️ **Logeren** - Bijhouden waar kinderen logeren
- ✅ **Taken** - Prioriteiten, deadlines en toewijzing
- 📱 **Mobile Responsive** - Optimaal voor telefoon gebruik

## 🐳 Docker Commando's

```bash
docker-start.bat       # Start de applicatie
docker-stop.bat        # Stop de applicatie
docker-logs.bat        # Bekijk logs
docker-rebuild.bat     # Herbouw containers
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structuur

```
gezin-app/
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # Herbruikbare componenten
│   │   ├── pages/        # Pagina componenten
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript types
│   │   └── styles/       # CSS bestanden
│   └── docs/             # Uitgebreide documentatie
├── backend/              # FastAPI Python backend
│   ├── main.py          # API endpoints
│   ├── models.py        # Data modellen
│   └── file_storage.py  # File storage handler
├── data/                 # Persistente data opslag
├── docker-compose.yml    # Docker orchestratie
├── Dockerfile           # Frontend container
└── backend/Dockerfile   # Backend container
```

## 🛠️ Technische Stack

### Frontend
- React 18 met TypeScript
- React Router voor navigatie
- Axios voor API calls
- React Calendar voor kalender
- Lucide React voor iconen
- Date-fns voor datum utilities

### Backend
- FastAPI (Python)
- Pydantic voor data validatie
- Uvicorn als ASGI server
- JSON file storage

### Infrastructure
- Docker & Docker Compose
- Nginx als reverse proxy
- Multi-stage builds voor optimale image sizes

## 📖 Uitgebreide Documentatie

Zie `frontend/docs/README.md` voor:
- Gedetailleerde functionaliteit beschrijvingen
- Lokale ontwikkelomgeving setup
- Configuratie opties
- Troubleshooting guide
- Aanpassingen en uitbreidingen

## 🔧 Ontwikkeling

### Docker Development
```bash
# Wijzig code en herbouw
docker-rebuild.bat

# Bekijk logs tijdens ontwikkeling
docker-logs.bat
```

### Lokale Development (zonder Docker)
Zie `frontend/docs/README.md` voor instructies voor lokale ontwikkeling.

## 🔐 Standaard Login

```
Username: admin
Password: gezin2024
```

Pas aan via `.env` file:
```
REACT_APP_USERNAME=jouw_username
REACT_APP_PASSWORD=jouw_password
```

## 💾 Data Opslag

- Alle data wordt opgeslagen in de `./data` directory
- Data blijft behouden tussen container restarts
- JSON formaat voor eenvoudige backup en restore
- Automatische synchronisatie tussen frontend en backend

## 🤝 Contributing

Dit is een persoonlijk project, maar suggesties zijn welkom!

## 📝 Licentie

Privé project - Alle rechten voorbehouden

## 🐛 Problemen?

1. Controleer of Docker Desktop actief is
2. Bekijk logs met `docker-logs.bat`
3. Probeer `docker-rebuild.bat` voor een schone rebuild
4. Zie `frontend/docs/README.md` voor uitgebreide troubleshooting

## ⭐ Features in Development

- [ ] Notificaties systeem
- [ ] Export/import functionaliteit
- [ ] Gedeelde gezinskalenders
- [ ] Mobile app (React Native)
- [ ] Backup naar cloud storage

---

Gemaakt met ❤️ voor gezinsorganisatie
