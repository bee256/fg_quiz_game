# Quiz Game Logging System

## Übersicht
Das Quiz-Spiel loggt automatisch alle abgeschlossenen Spiele in monatliche Log-Dateien im `log/`-Verzeichnis.

## Log-Dateien
- **Verzeichnis:** `log/`
- **Namensformat:** `game-YYYY-MM.log` (z.B. `game-2025-08.log`)
- **Automatische Erstellung:** Für jeden Monat wird automatisch eine neue Log-Datei erstellt

## Log-Format
Jede Zeile im Log enthält folgende Informationen (Tab-getrennt):

```
timestamp	username	category	duration	score	total	device	userAgent
```

### Felder:
- **timestamp**: UTC-Zeitstempel im ISO-Format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **username**: Benutzername oder "Gast" falls nicht gesetzt
- **category**: Wissensgebiet (z.B. allgemeinwissen, sport, geschichte)
- **duration**: Spieldauer in Sekunden (z.B. 127s)
- **score**: Erreichte Punkte (z.B. 10)
- **total**: Mögliche Gesamtpunkte (z.B. 12)
- **device**: Gerätetyp (Desktop, Mobile, Tablet)
- **userAgent**: Vollständiger Browser User-Agent String

## Datenschutz
- **Keine IP-Adressen** werden gespeichert
- Nur User-Agent für Gerätetyp-Erkennung verwendet
- Benutzernamen werden nur bei bewusster Eingabe gespeichert

## Admin Interface
Für eine benutzerfreundliche Analyse der Log-Daten steht ein Web-Interface zur Verfügung:

- **URL:** `/admin` (z.B. http://localhost:3000/admin)
- **Authentifizierung:** Passwort-geschützt (Standard: `admin123`)
- **Funktionen:** 
  - Monatsweise Anzeige der Logs
  - Statistische Auswertungen
  - CSV-Export
  - Responsive Design für mobile Geräte

Detaillierte Informationen finden Sie in der [ADMIN.md](ADMIN.md).

## Datenschutz

## Beispiel-Einträge
```
2025-08-01T12:30:45.123Z	TestUser	allgemeinwissen	127s	10	12	Desktop	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
2025-08-01T12:35:12.456Z	Gast	sport	98s	8	12	Mobile	Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15
2025-08-01T12:40:33.789Z	SportFan	geschichte	145s	11	12	Tablet	Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15
```

## Log-Rotation
Die Log-Dateien werden automatisch monatlich rotiert. Alte Log-Dateien bleiben erhalten und können für historische Analysen verwendet werden.

## Auswertung
Das Log kann mit Standard-Unix-Tools ausgewertet werden:

```bash
# Auswertung aller Log-Dateien
cat log/game-*.log | head -5

# Auswertung eines bestimmten Monats
cat log/game-2025-08.log | head -5

# Anzahl Spiele pro Kategorie (alle Monate)
cat log/game-*.log | cut -f3 | sort | uniq -c

# Anzahl Spiele pro Kategorie (bestimmter Monat)
cut -f3 log/game-2025-08.log | sort | uniq -c

# Durchschnittliche Spieldauer (alle Monate)
cat log/game-*.log | awk -F'\t' '{gsub(/s/, "", $4); sum+=$4; count++} END {print sum/count "s"}'

# Durchschnittliche Spieldauer (bestimmter Monat)
awk -F'\t' '{gsub(/s/, "", $4); sum+=$4; count++} END {print sum/count "s"}' log/game-2025-08.log

# Durchschnittliche Punktzahl (alle Monate)
cat log/game-*.log | awk -F'\t' '{sum+=$5; count++} END {print sum/count}'

# Durchschnittliche Erfolgsquote (Prozent, alle Monate)
cat log/game-*.log | awk -F'\t' '{sum+=($5/$6)*100; count++} END {print sum/count "%"}'

# Top Spieler nach Score (mindestens 80%, alle Monate)
cat log/game-*.log | awk -F'\t' '{if($5/$6 >= 0.8) print $2, $5"/"$6}' | sort | uniq

# Browser-Verteilung (alle Monate)
cat log/game-*.log | cut -f8 | awk '{print $1}' | sort | uniq -c

# Gerätetyp-Verteilung (alle Monate)
cat log/game-*.log | cut -f7 | sort | uniq -c

# Spiele nach Betriebssystem (alle Monate)
cat log/game-*.log | grep -o "Windows\|Mac OS X\|Linux\|Android\|iOS" | sort | uniq -c

# Beste Scores pro Kategorie (alle Monate)
cat log/game-*.log | awk -F'\t' '{if($5 > max[$3]) max[$3] = $5} END {for(cat in max) print cat, max[cat]}'

# Anzahl perfekte Scores (100%, alle Monate)
cat log/game-*.log | awk -F'\t' '{if($5 == $6) count++} END {print count " perfekte Spiele"}'

# Spieldauer nach Kategorie (alle Monate)
cat log/game-*.log | awk -F'\t' '{gsub(/s/, "", $4); sum[$3]+=$4; count[$3]++} END {for(cat in sum) print cat, sum[cat]/count[cat] "s"}'

# Performance nach Gerätetyp (alle Monate)
cat log/game-*.log | awk -F'\t' '{sum[$7]+=($5/$6)*100; count[$7]++} END {for(dev in sum) print dev, sum[dev]/count[dev] "%"}'

# Aktivität nach Monat
ls log/game-*.log | xargs -I {} sh -c 'echo -n "{}: "; wc -l < {}'

# Trends: Vergleich zwischen Monaten
for file in log/game-*.log; do
    month=$(basename $file .log | cut -d- -f2,3)
    avg_score=$(awk -F'\t' '{sum+=($5/$6)*100; count++} END {print sum/count}' $file)
    echo "$month: $avg_score% Erfolgsquote"
done
```
