# Quiz Game - Fragenverwaltung

## 📁 Struktur der Fragendateien

Die Fragen sind jetzt in separate JSON-Dateien aufgeteilt, die im `questions/` Verzeichnis gespeichert werden.

### Dateinamen-Konvention

```
{order}_{categoryId}.json
```

- `{order}`: Nummer für die Sortierung (1, 2, 3, ...)
- `{categoryId}`: Eindeutige ID der Kategorie (z.B. "friedrich-gymnasium", "allgemeinwissen")

**Beispiele:**
- `1_friedrich-gymnasium.json`
- `2_allgemeinwissen.json` 
- `3_geschichte.json`

### JSON-Struktur

Jede Kategorie-Datei folgt dieser Struktur:

```json
{
    "metadata": {
        "categoryId": "friedrich-gymnasium",
        "displayName": "Friedrich-Gymnasium Freiburg",
        "description": "Fragen über das Friedrich-Gymnasium in Freiburg im Breisgau",
        "icon": "🏫",
        "order": 1
    },
    "questions": [
        {
            "id": 1,
            "question": "Frage-Text hier",
            "answers": [
                "Antwort A",
                "Antwort B", 
                "Antwort C",
                "Antwort D"
            ],
            "correct": 0
        }
    ]
}
```

### Metadaten-Felder

- **categoryId**: Eindeutige ID für interne Verwendung
- **displayName**: Name, der in der Benutzeroberfläche angezeigt wird
- **description**: Kurze Beschreibung der Kategorie
- **icon**: Emoji-Icon für die Kategorie
- **order**: Sortier-Reihenfolge (wird auch durch Dateiname bestimmt)

### Fragen-Felder

- **id**: Eindeutige ID innerhalb der Kategorie
- **question**: Der Fragetext
- **answers**: Array mit 4 Antwortmöglichkeiten
- **correct**: Index der richtigen Antwort (0-3)

## 🚀 Neue Fragen hinzufügen

### 1. Frage zu bestehender Kategorie hinzufügen

Bearbeiten Sie die entsprechende JSON-Datei und fügen Sie ein neues Frage-Objekt zum `questions`-Array hinzu:

```json
{
    "id": 13,
    "question": "Neue Frage hier",
    "answers": ["A", "B", "C", "D"],
    "correct": 1
}
```

### 2. Neue Kategorie erstellen

1. Erstellen Sie eine neue JSON-Datei mit der Namenskonvention `{order}_{categoryId}.json`
2. Verwenden Sie die vollständige Struktur mit Metadaten und Fragen
3. Der Server lädt automatisch alle Dateien im `questions/` Verzeichnis

### 3. Sortierung ändern

Benennen Sie die Dateien um, um die gewünschte Reihenfolge zu erreichen:

```bash
mv 3_geschichte.json 2_geschichte.json
mv 2_allgemeinwissen.json 3_allgemeinwissen.json
```

## 🔧 Technische Details

### Automatisches Laden

Der Server lädt beim Start automatisch alle JSON-Dateien aus dem `questions/` Verzeichnis:

```javascript
const { questions, categories } = loadQuestions();
```

### Legacy-Unterstützung

Der System unterstützt sowohl die neue Struktur (mit Metadaten) als auch die alte Struktur (direktes Array) für Abwärtskompatibilität.

### Validierung

- Jede Kategorie wird beim Laden validiert
- Fehlende oder ungültige Dateien werden geloggt
- Das System läuft auch wenn einzelne Kategorien fehlerhaft sind

## 📊 Aktuelle Kategorien

1. 🏫 **Friedrich-Gymnasium Freiburg** (12 Fragen)
2. 🌍 **Allgemeinwissen** (41 Fragen)
3. 🏛️ **Geschichte** (43 Fragen)
4. 🔬 **Wissenschaft** (43 Fragen)
5. ⚽ **Sport** (43 Fragen)
6. 🗺️ **Geografie** (43 Fragen)
7. 🎨 **Kunst & Kultur** (43 Fragen)

**Gesamtanzahl:** 268 Fragen (12 pro Quiz-Runde werden zufällig ausgewählt)
