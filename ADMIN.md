# Admin Interface

## Zugriff
Das Admin Interface ist unter der URL `/admin` verfügbar:
```
http://localhost:3000/admin
```

## Anmeldung
- **Standard-Passwort:** `admin123`
- **Sicherheit:** In Produktionsumgebungen sollte das Passwort über die Environment-Variable `ADMIN_PASSWORD` gesetzt werden

## Funktionen

### 🔐 Authentifizierung
- Passwort-geschützter Zugang
- Session-basierte Tokens (24h Gültigkeit)
- Automatische Abmeldung bei Inaktivität

### 📊 Log-Analyse
- **Monatsauswahl:** Dropdown mit allen verfügbaren Log-Monaten
- **Statistiken:** 
  - Gesamte Spiele des Monats
  - Durchschnittliche Erfolgsquote
  - Durchschnittliche Spieldauer
  - Beliebteste Kategorie

### 📋 Log-Daten
- **Tabellarische Anzeige:** Alle Spiele des ausgewählten Monats
- **Sortierung:** Chronologisch (neueste zuerst)
- **Informationen pro Spiel:**
  - Zeitstempel
  - Benutzername
  - Kategorie
  - Spieldauer
  - Score mit Prozentangabe
  - Gerätetyp

### 💾 Export
- **CSV-Download:** Vollständiger Export der Log-Daten
- **Dateiname:** `quiz-logs-YYYY-MM.csv`
- **Inhalt:** Alle Spieldaten inklusive User-Agent für detaillierte Analyse

## Sicherheit

### Passwort-Konfiguration
```bash
# Produktionsumgebung
export ADMIN_PASSWORD="sicheres_passwort_hier"
export JWT_SECRET="langer_zufälliger_string"
```

### Token-Verwaltung
- Tokens laufen automatisch nach 24 Stunden ab
- Bei Server-Neustart werden alle Tokens ungültig
- Nur ein Login pro Session erforderlich

### Zugriffsprotokolle
- Erfolgreiche Logins werden im Server-Log verzeichnet
- Fehlgeschlagene Login-Versuche werden protokolliert

## API-Endpunkte

### Authentication
```
POST /admin/login
Body: { "password": "admin123" }
Response: { "success": true, "token": "..." }
```

### Token-Verifikation
```
GET /admin/verify
Headers: Authorization: Bearer <token>
Response: { "valid": true }
```

### Verfügbare Monate
```
GET /admin/months
Headers: Authorization: Bearer <token>
Response: { "months": ["2025-08", "2025-07", ...] }
```

### Log-Daten abrufen
```
GET /admin/logs/:month
Headers: Authorization: Bearer <token>
Response: { "logs": [...] }
```

## Mobile Optimierung
Das Admin Interface ist vollständig responsive und funktioniert auf:
- Desktop-Computern
- Tablets
- Smartphones

## Troubleshooting

### Passwort vergessen
Das Standard-Passwort ist `admin123`. In Produktionsumgebungen kann es über Environment-Variablen geändert werden.

### Keine Log-Daten sichtbar
1. Überprüfen Sie, ob Log-Dateien im `log/`-Verzeichnis vorhanden sind
2. Stellen Sie sicher, dass bereits Spiele gespielt wurden
3. Überprüfen Sie die Server-Logs auf Fehlermeldungen

### Token-Probleme
Bei Problemen mit der Authentifizierung:
1. Seite neu laden
2. Erneut anmelden
3. Browser-Cache leeren

## Wartung

### Log-Archivierung
Alte Log-Dateien können manuell archiviert werden:
```bash
# Logs älter als 6 Monate archivieren
mkdir -p archive
mv log/game-2024-*.log archive/
```

### Performance
Bei sehr großen Log-Dateien (>10MB) kann die Anzeige langsam werden. Empfehlung: Monatliche Archivierung implementieren.
