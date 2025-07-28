# 🎯 Quiz Spiel - Friedrich-Gymnasium Edition

Ein umfassendes interaktives Quizspiel mit über 1.200 Fragen in 7 Kategorien, entwickelt mit moderner Server/Client-Architektur.

## ✨ Features

- 🏫 **Friedrich-Gymnasium Kategorie** - Spezielle Fragen zur Schule
- 🧠 **6 Wissenskategorien** mit je 200 Fragen:
  - Allgemeinwissen
  - Geschichte  
  - Wissenschaft
  - Sport
  - Geografie
  - Kunst & Kultur
- ⏱️ **Timer-System** - Zeitdruck für spannende Quizrunden
- 🎲 **Zufällige Fragenauswahl** - 12 Fragen pro Quiz
- 📱 **Responsive Design** - Funktioniert auf allen Geräten
- 🔄 **Modular erweiterbar** - Einfaches Hinzufügen neuer Kategorien

## 🏗️ Architektur

### Backend (Node.js/Express)
- RESTful API mit Express.js
- Modulares Fragen-Ladesystem
- Session-basierte Quiz-Durchführung
- Sichere Antwort-Validierung
- Dateibasierte Fragenverwaltung mit JSON

### Frontend (Vanilla JavaScript)
- Moderne ES6+ JavaScript ohne Frameworks
- Responsive CSS Grid/Flexbox Layout
- Async/await API-Kommunikation
- Intuitive Benutzeroberfläche
- Loading-Indikatoren und Fehlerbehandlung

## 🚀 Installation und Start

### Voraussetzungen
- Node.js (Version 14 oder höher)
- npm

### Installation
```bash
# Repository klonen
git clone [REPOSITORY_URL]
cd copilot-vanilla-js2

# Dependencies installieren
npm install

# Server starten
npm start
```

### Zugriff
- Öffnen Sie http://localhost:3000 in Ihrem Browser
- Das Quiz lädt automatisch alle verfügbaren Kategorien

## 📋 API Endpunkte

### `GET /api/categories`
Gibt alle verfügbaren Quiz-Kategorien mit Metadaten zurück.

**Response:**
```json
{
  "categories": [
    {
      "categoryId": "friedrich-gymnasium",
      "displayName": "Friedrich-Gymnasium Freiburg",
      "description": "Spezielle Fragen rund um das Friedrich-Gymnasium",
      "icon": "🏫",
      "order": 1,
      "questionCount": 12
    },
    {
      "categoryId": "allgemeinwissen", 
      "displayName": "Allgemeinwissen",
      "description": "Fragen aus allen Lebensbereichen",
      "icon": "🧠",
      "order": 2,
      "questionCount": 200
    }
  ]
}
```

### `POST /api/quiz/start`
Startet ein neues Quiz für eine bestimmte Kategorie.

**Request:**
```json
{"category": "allgemeinwissen"}
```

**Response:**
```json
{
  "sessionId": "abc123xyz",
  "totalQuestions": 12,
  "category": "Allgemeinwissen"
}
```

### `GET /api/quiz/:sessionId/question`
Gibt die nächste Frage für eine Session zurück.

**Response:**
```json
{
  "id": 1,
  "question": "Welches ist das größte Säugetier der Welt?",
  "answers": ["Elefant", "Blauwal", "Giraffe", "Nashorn"],
  "questionNumber": 1,
  "totalQuestions": 12
}
  "totalQuestions": 12
}
```

### `POST /api/quiz/:sessionId/answer`
Übermittelt eine Antwort und gibt das Ergebnis zurück.

**Request:**
```json
{"answerIndex": 1}
```

**Response:**
```json
{
  "correct": true,
  "correctAnswer": 1,
  "score": 3,
  "isLastQuestion": false
}
```

### `GET /api/quiz/:sessionId/result`
Gibt das finale Quiz-Ergebnis zurück.

**Response:**
```json
{
  "score": 8,
  "totalQuestions": 12,
  "percentage": 67,
  "category": "Allgemeinwissen",
  "answers": [...]
}
```

### `DELETE /api/quiz/:sessionId`
Beendet eine Quiz-Session.

## 🎮 Features

- **6 verschiedene Kategorien**: Allgemeinwissen, Geschichte, Wissenschaft, Sport, Geografie, Kunst & Kultur
- **Sichere API**: Antworten werden serverseitig validiert
- **Session-Management**: Jedes Quiz läuft in einer eigenen Session
- **Zufällige Fragen**: Fragen werden für jede Session neu gemischt
- **Responsive Design**: Funktioniert auf Desktop und Mobile
- **Loading-Indikatoren**: Bessere Benutzererfahrung bei API-Calls
- **Fehlerbehandlung**: Robuste Error-Recovery

## 📁 Projektstruktur

```
quiz-game/
├── server.js                    # Express Server mit API
├── questions-loader.js          # Modulares Fragen-Ladesystem  
├── package.json                # Node.js Dependencies
├── public/                     # Client-seitige Dateien
│   ├── index.html             # HTML Interface
│   ├── styles.css             # CSS Styles
│   └── script.js              # Client JavaScript (QuizGame Klasse)
├── questions/                  # Fragendatenbank (JSON Files)
│   ├── 1_friedrich-gymnasium.json  # 12 Fragen zur Schule
│   ├── 2_allgemeinwissen.json      # 200 Allgemeinwissen-Fragen
│   ├── 3_geschichte.json           # 200 Geschichte-Fragen
│   ├── 4_wissenschaft.json         # 200 Wissenschaft-Fragen
│   ├── 5_sport.json               # 200 Sport-Fragen
│   ├── 6_geografie.json           # 200 Geografie-Fragen
│   └── 7_kunst.json               # 200 Kunst & Kultur-Fragen
└── README.md                   # Diese Dokumentation
```

## 🗂️ Fragenverwaltung

### JSON-Struktur
Jede Kategorie-Datei folgt diesem Schema:

```json
{
  "metadata": {
    "categoryId": "allgemeinwissen",
    "displayName": "Allgemeinwissen", 
    "description": "Fragen aus allen Lebensbereichen",
    "icon": "🧠",
    "order": 2
  },
  "questions": [
    {
      "id": 1,
      "question": "Welches ist das größte Säugetier der Welt?",
      "answers": ["Elefant", "Blauwal", "Giraffe", "Nashorn"],
      "correct": 1
    }
  ]
}
```

### Neue Kategorien hinzufügen
1. Neue JSON-Datei im Format `{order}_{categoryId}.json` erstellen
2. Metadata und Fragen-Array definieren
3. Server neu starten - automatisches Laden

## 🔧 Technologien

### Backend
- **Node.js**: JavaScript Runtime
- **Express.js**: Web Framework  
- **File System**: JSON-basierte Fragenspeicherung

### Frontend
- **HTML5**: Semantische Struktur
- **CSS3**: Grid, Flexbox, moderne UI
- **Vanilla JavaScript**: ES6+ Klassen, async/await

## 🛡️ Sicherheit

- Antworten werden nicht an den Client gesendet
- Server-seitige Validierung aller Eingaben
- Session-basierte Zugriffskontrolle
- CORS-Schutz aktiviert

## 🚀 Produktions-Deployment

### Umgebungsvariablen
```bash
PORT=3000  # Server Port
```

### Docker (optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## � Statistiken

- **Gesamtfragen**: 1.212 Fragen
- **Kategorien**: 7 verschiedene Wissensgebiete
- **Friedrich-Gymnasium**: 12 spezielle Schulfragen
- **Weitere Kategorien**: Je 200 Fragen für maximale Vielfalt
- **Quiz-Länge**: 12 zufällig ausgewählte Fragen pro Durchgang
- **Mögliche Kombinationen**: Über 100 komplett verschiedene Quiz-Durchgänge

## 🛡️ Sicherheit

- Antworten werden nicht an den Client gesendet
- Server-seitige Validierung aller Eingaben  
- Session-basierte Zugriffskontrolle
- Sichere Fragen-ID Verwaltung

## 🚀 Entwicklung

### Lokale Entwicklung
```bash
# Development-Server mit Auto-Reload
npm run dev

# Produktions-Server
npm start
```

### Fragen erweitern
Das Projekt enthält Hilfsskripte für die Fragenerweiterung:
- `extend-allgemeinwissen.js` - Beispiel für Kategorie-Erweiterung
- `extend-all-categories.js` - Massen-Erweiterung aller Kategorien

## 🎯 Zukünftige Erweiterungen

- 🏆 **Highscore-System** - Bestenlisten speichern
- 👥 **Multiplayer-Modus** - Gemeinsam oder gegeneinander spielen  
- 📱 **Progressive Web App** - Offline-Funktionalität
- 🎨 **Themes & Skins** - Anpassbare Oberflächen
- 📈 **Statistiken** - Detaillierte Spieler-Analytics
- 🔊 **Audio-Features** - Sounds und Sprachausgabe

## 🤝 Beitragen

Möchten Sie neue Fragen hinzufügen oder Features entwickeln?

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Fügen Sie Ihre Änderungen hinzu
4. Erstellen Sie einen Pull Request

## 📝 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## 👨‍💻 Entwickelt für das Friedrich-Gymnasium Freiburg

Speziell entwickelt als interaktives Lernwerkzeug mit schulspezifischen Inhalten und umfassendem Allgemeinwissen für Schüler und Lehrer.

- [ ] **Datenbank-Integration** (MongoDB/PostgreSQL)
- [ ] **Benutzer-Authentifizierung** und Profile
- [ ] **Bestenlisten** und Statistiken
- [ ] **Multiplayer-Modus**
- [ ] **Admin-Panel** zum Verwalten von Fragen
- [ ] **Kategorie-Editor** für dynamische Inhalte
- [ ] **Zeitlimits** für Fragen
- [ ] **Schwierigkeitsgrade**
- [ ] **Sound-Effekte** und Animationen

## 📊 Performance

- Optimierte API-Calls mit Loading-States
- Minimale Datenübertragung
- Session-basierte Zustandsverwaltung
- Responsive Caching-Strategien

## 🐛 Entwicklung

### Development Mode
```bash
npm run dev  # Startet mit nodemon für Auto-Reload
```

### Debugging
- Server läuft auf Port 3000
- Logs in der Konsole verfügbar
- Browser DevTools für Client-Debugging

## 📜 Lizenz

Dieses Projekt ist frei verfügbar für persönliche und kommerzielle Nutzung.
