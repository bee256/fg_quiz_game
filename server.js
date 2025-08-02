const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { loadQuestions } = require('./questions-loader');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin-Konfiguration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // In Produktion über Environment Variable setzen

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fragendatenbank aus JSON-Dateien laden
console.log('🔄 Lade Fragendatenbank...');
const { questions, categories } = loadQuestions();

// Highscores-Datei Pfad
const HIGHSCORES_FILE = path.join(__dirname, 'highscores.json');
const LOG_DIR = path.join(__dirname, 'log');

// Log-Verzeichnis erstellen falls es nicht existiert
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Hilfsfunktionen für persistente Highscores
function loadHighscores() {
    try {
        if (fs.existsSync(HIGHSCORES_FILE)) {
            const data = fs.readFileSync(HIGHSCORES_FILE, 'utf8');
            const parsed = JSON.parse(data);
            const highscoresMap = new Map();
            
            // Konvertiere das Objekt zurück in eine Map
            Object.keys(parsed).forEach(category => {
                highscoresMap.set(category, parsed[category]);
            });
            
            console.log('📊 Highscores aus Datei geladen');
            return highscoresMap;
        }
    } catch (error) {
        console.error('❌ Fehler beim Laden der Highscores:', error.message);
    }
    
    console.log('📊 Neue Highscores-Datei wird erstellt');
    return new Map();
}

function saveHighscores(highscoresMap) {
    try {
        // Konvertiere Map in ein Objekt für JSON-Serialisierung
        const highscoresObj = {};
        highscoresMap.forEach((value, key) => {
            highscoresObj[key] = value;
        });
        
        fs.writeFileSync(HIGHSCORES_FILE, JSON.stringify(highscoresObj, null, 2));
        console.log('💾 Highscores gespeichert');
    } catch (error) {
        console.error('❌ Fehler beim Speichern der Highscores:', error.message);
    }
}

// Hilfsfunktionen für Game Logging
function getMonthlyLogFile() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const filename = `game-${year}-${month}.log`;
    return path.join(LOG_DIR, filename);
}

function logGame(username, category, duration, score, totalQuestions, userAgent) {
    try {
        const timestamp = new Date().toISOString();
        
        // Extrahiere Geräte-Information aus User-Agent (ohne IP)
        let device = 'Unknown';
        if (userAgent) {
            if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
                device = 'Mobile';
            } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
                device = 'Tablet';
            } else {
                device = 'Desktop';
            }
        }
        
        // Bereinige User-Agent (entferne Tabs und Newlines für Log-Format)
        const cleanUserAgent = userAgent ? userAgent.replace(/[\t\n\r]/g, ' ').trim() : 'Unknown';
        
        // Format: timestamp, username, category, duration, score, total, device, userAgent
        const logEntry = `${timestamp}\t${username || 'Gast'}\t${category}\t${duration}s\t${score}\t${totalQuestions}\t${device}\t${cleanUserAgent}\n`;
        
        // Ermittle monatliche Log-Datei
        const monthlyLogFile = getMonthlyLogFile();
        
        // Append to log file
        fs.appendFileSync(monthlyLogFile, logEntry);
        console.log(`📝 Spiel geloggt: ${username || 'Gast'} - ${category} - ${score}/${totalQuestions}`);
    } catch (error) {
        console.error('❌ Fehler beim Loggen des Spiels:', error.message);
    }
}

// Aktive Quiz-Sessions (in Produktion würde das in einer Datenbank gespeichert)
const activeSessions = new Map();

// Timer-Konfiguration (in Sekunden)
const QUESTION_TIME_LIMIT = 10; // 10 Sekunden pro Frage

// Hilfsfunktion zum Mischen eines Arrays
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Hilfsfunktion zum Mischen der Antworten einer Frage
function shuffleAnswers(question) {
    const originalAnswers = [...question.answers];
    const originalCorrect = question.correct;
    const correctAnswer = originalAnswers[originalCorrect];
    
    // Array mit Indizes erstellen und mischen
    const indices = Array.from({ length: originalAnswers.length }, (_, i) => i);
    const shuffledIndices = shuffleArray(indices);
    
    // Antworten in neuer Reihenfolge erstellen
    const shuffledAnswers = shuffledIndices.map(i => originalAnswers[i]);
    
    // Neuen Index für die richtige Antwort finden
    const newCorrectIndex = shuffledAnswers.indexOf(correctAnswer);
    
    return {
        ...question,
        answers: shuffledAnswers,
        correct: newCorrectIndex,
        originalCorrect: originalCorrect // Für Debugging
    };
}

// API Endpoints

// Alle verfügbaren Kategorien abrufen
app.get('/api/categories', (req, res) => {
    // Kategorien sind bereits sortiert durch die loadQuestions-Funktion
    const categoryList = categories.map(cat => ({
        id: cat.id,
        name: cat.displayName,
        description: cat.description,
        icon: cat.icon,
        order: cat.order
    }));
    res.json({ categories: categoryList });
});

// Quiz für eine Kategorie starten
app.post('/api/quiz/start', (req, res) => {
    const { category } = req.body;
    
    if (!questions[category]) {
        return res.status(400).json({ error: 'Ungültige Kategorie' });
    }
    
    // Session ID generieren
    const sessionId = Math.random().toString(36).substr(2, 9);
    
    // Fragen mischen und auf 12 begrenzen
    const allQuestions = shuffleArray(questions[category]);
    const selectedQuestions = allQuestions.slice(0, 12);
    
    // Session speichern
    activeSessions.set(sessionId, {
        category,
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        currentShuffledQuestion: null, // Wird bei jeder Frage neu gesetzt
        score: 0,
        answers: [],
        startTime: Date.now(),
        questionStartTime: null,
        totalTimeSpent: 0,
        timeBonus: 0
    });
    
    res.json({
        sessionId,
        totalQuestions: selectedQuestions.length,
        category: getCategoryDisplayName(category),
        timeLimit: QUESTION_TIME_LIMIT
    });
});

// Nächste Frage abrufen
app.get('/api/quiz/:sessionId/question', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Quiz-Session nicht gefunden' });
    }
    
    const { questions: sessionQuestions, currentQuestionIndex } = session;
    
    if (currentQuestionIndex >= sessionQuestions.length) {
        return res.status(400).json({ error: 'Quiz bereits beendet' });
    }
    
    const originalQuestion = sessionQuestions[currentQuestionIndex];
    
    // Antworten für diese Frage mischen
    const shuffledQuestion = shuffleAnswers(originalQuestion);
    
    // Gemischte Frage in der Session speichern (für Antwort-Vergleich)
    session.currentShuffledQuestion = shuffledQuestion;
    
    // Timer für diese Frage starten
    session.questionStartTime = Date.now();
    
    // Antwort nicht an Client senden
    const { correct, originalCorrect, ...questionWithoutAnswer } = shuffledQuestion;
    
    res.json({
        ...questionWithoutAnswer,
        questionNumber: currentQuestionIndex + 1,
        totalQuestions: sessionQuestions.length,
        timeLimit: QUESTION_TIME_LIMIT,
        startTime: session.questionStartTime
    });
});

// Antwort einreichen
app.post('/api/quiz/:sessionId/answer', (req, res) => {
    const { sessionId } = req.params;
    const { answerIndex } = req.body;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Quiz-Session nicht gefunden' });
    }
    
    const { questions: sessionQuestions, currentQuestionIndex } = session;
    
    if (currentQuestionIndex >= sessionQuestions.length) {
        return res.status(400).json({ error: 'Quiz bereits beendet' });
    }
    
    // Verwende die gemischte Frage für die Antwort-Überprüfung
    const shuffledQuestion = session.currentShuffledQuestion;
    const isCorrect = answerIndex === shuffledQuestion.correct;
    
    // Zeit-Berechnung
    const currentTime = Date.now();
    const questionTime = (currentTime - session.questionStartTime) / 1000; // in Sekunden
    const timeLeft = Math.max(0, QUESTION_TIME_LIMIT - questionTime);
    const wasInTime = questionTime <= QUESTION_TIME_LIMIT;
    
    // Score-Berechnung mit Zeit-Bonus
    let points = 0;
    let timeBonus = 0;
    
    if (isCorrect && wasInTime) {
        points = 1; // Grundpunkte für richtige Antwort
        // Zeit-Bonus: Mehr Punkte für schnellere Antworten
        if (timeLeft > 7) {
            timeBonus = 3; // Sehr schnell (< 3 Sekunden)
        } else if (timeLeft > 4) {
            timeBonus = 2; // Schnell (< 6 Sekunden)
        } else if (timeLeft > 0) {
            timeBonus = 1; // Rechtzeitig (< 10 Sekunden)
        }
        
        session.score += points + timeBonus;
        session.timeBonus += timeBonus;
    }
    
    session.totalTimeSpent += Math.min(questionTime, QUESTION_TIME_LIMIT);
    
    // Antwort speichern (verwende Original-Frage für die ID)
    const originalQuestion = sessionQuestions[currentQuestionIndex];
    session.answers.push({
        questionId: originalQuestion.id,
        answerIndex,
        correct: isCorrect,
        timeSpent: questionTime,
        timeBonus: timeBonus,
        wasInTime: wasInTime,
        points: points + timeBonus
    });
    
    session.currentQuestionIndex++;
    
    res.json({
        correct: isCorrect,
        correctAnswer: shuffledQuestion.correct,
        score: session.score,
        timeSpent: questionTime,
        timeBonus: timeBonus,
        wasInTime: wasInTime,
        points: points + timeBonus,
        isLastQuestion: session.currentQuestionIndex >= sessionQuestions.length
    });
});

// Timeout für eine Frage (wenn Zeit abgelaufen ist)
app.post('/api/quiz/:sessionId/timeout', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Quiz-Session nicht gefunden' });
    }
    
    const { questions: sessionQuestions, currentQuestionIndex } = session;
    
    if (currentQuestionIndex >= sessionQuestions.length) {
        return res.status(400).json({ error: 'Quiz bereits beendet' });
    }
    
    const originalQuestion = sessionQuestions[currentQuestionIndex];
    const shuffledQuestion = session.currentShuffledQuestion;
    
    // Zeit-Berechnung für Timeout
    const currentTime = Date.now();
    const questionTime = (currentTime - session.questionStartTime) / 1000;
    
    session.totalTimeSpent += QUESTION_TIME_LIMIT;
    
    // Antwort als falsch/timeout speichern
    session.answers.push({
        questionId: originalQuestion.id,
        answerIndex: -1, // -1 für Timeout
        correct: false,
        timeSpent: questionTime,
        timeBonus: 0,
        wasInTime: false,
        points: 0,
        timeout: true
    });
    
    session.currentQuestionIndex++;
    
    res.json({
        correct: false,
        correctAnswer: shuffledQuestion.correct,
        score: session.score,
        timeSpent: questionTime,
        timeBonus: 0,
        wasInTime: false,
        points: 0,
        timeout: true,
        isLastQuestion: session.currentQuestionIndex >= sessionQuestions.length
    });
});

// Quiz-Ergebnis abrufen
app.get('/api/quiz/:sessionId/result', (req, res) => {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Quiz-Session nicht gefunden' });
    }
    
    const totalQuestions = session.questions.length;
    const correctAnswers = session.answers.filter(a => a.correct).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const avgTimePerQuestion = session.totalTimeSpent / totalQuestions;
    const totalPossibleScore = totalQuestions * 4; // Max: 1 Grundpunkt + 3 Zeitbonus
    const scorePercentage = Math.round((session.score / totalPossibleScore) * 100);
    
    res.json({
        score: session.score,
        correctAnswers: correctAnswers,
        totalQuestions,
        percentage,
        scorePercentage,
        category: getCategoryDisplayName(session.category),
        answers: session.answers,
        totalTimeSpent: Math.round(session.totalTimeSpent),
        avgTimePerQuestion: Math.round(avgTimePerQuestion * 10) / 10,
        timeBonus: session.timeBonus,
        totalPossibleScore
    });
});

// Quiz-Session beenden
app.delete('/api/quiz/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (activeSessions.has(sessionId)) {
        activeSessions.delete(sessionId);
        res.json({ message: 'Session beendet' });
    } else {
        res.status(404).json({ error: 'Session nicht gefunden' });
    }
});

// Highscore-System mit persistenter Speicherung
const highscores = loadHighscores(); // Format: category -> Array of {username, score, totalQuestions, timestamp}

// Highscores für eine Kategorie abrufen
app.get('/api/highscores/:category', (req, res) => {
    const { category } = req.params;
    
    if (!questions[category]) {
        return res.status(400).json({ error: 'Ungültige Kategorie' });
    }
    
    const categoryHighscores = highscores.get(category) || [];
    
    // Sortiere nach Score (absteigend), dann nach Datum (aufsteigend für ältere zuerst bei gleichem Score)
    const sortedHighscores = categoryHighscores
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // Höhere Punkte zuerst
            }
            return a.timestamp - b.timestamp; // Bei gleichem Score: älterer Eintrag zuerst
        })
        .slice(0, 10); // Top 10
    
    res.json({ highscores: sortedHighscores });
});

// Neuen Highscore speichern
app.post('/api/highscores', (req, res) => {
    const { username, category, score, totalQuestions, sessionId } = req.body;
    
    if (!username || !category || score === undefined || totalQuestions === undefined) {
        return res.status(400).json({ error: 'Fehlende Parameter' });
    }
    
    if (!questions[category]) {
        return res.status(400).json({ error: 'Ungültige Kategorie' });
    }
    
    if (username.length > 20) {
        return res.status(400).json({ error: 'Benutzername zu lang' });
    }
    
    // Berechne Spieldauer falls sessionId vorhanden
    let gameDuration = 0;
    if (sessionId && activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId);
        gameDuration = Math.round((Date.now() - session.startTime) / 1000); // in Sekunden
    }
    
    // Logge das abgeschlossene Spiel
    const userAgent = req.headers['user-agent'];
    logGame(username, category, gameDuration, score, totalQuestions, userAgent);
    
    // Initialisiere Array für Kategorie falls nicht vorhanden
    if (!highscores.has(category)) {
        highscores.set(category, []);
    }
    
    const categoryHighscores = highscores.get(category);
    
    // Prüfe ob der Benutzer bereits einen Score für diese Kategorie hat
    const existingScoreIndex = categoryHighscores.findIndex(entry => entry.username === username);
    
    let isNewHighscore = false;
    
    if (existingScoreIndex !== -1) {
        // Benutzer hat bereits einen Score - aktualisiere nur wenn neuer Score besser ist
        const existingScore = categoryHighscores[existingScoreIndex];
        if (score > existingScore.score) {
            categoryHighscores[existingScoreIndex] = {
                username,
                score,
                totalQuestions,
                timestamp: Date.now()
            };
            isNewHighscore = true;
        }
    } else {
        // Neuer Benutzer für diese Kategorie
        categoryHighscores.push({
            username,
            score,
            totalQuestions,
            timestamp: Date.now()
        });
        isNewHighscore = true;
    }
    
    // Speichere Highscores in Datei, falls sich etwas geändert hat
    if (isNewHighscore) {
        saveHighscores(highscores);
    }
    
    res.json({ 
        message: 'Highscore gespeichert',
        isNewHighscore
    });
});

// Spiel-Log Endpoint für alle Spiele (auch Gäste)
app.post('/api/game-log', (req, res) => {
    const { username, category, score, totalQuestions, sessionId } = req.body;
    
    if (!category || score === undefined || totalQuestions === undefined) {
        return res.status(400).json({ error: 'Fehlende Parameter' });
    }
    
    if (!questions[category]) {
        return res.status(400).json({ error: 'Ungültige Kategorie' });
    }
    
    // Berechne Spieldauer falls sessionId vorhanden
    let gameDuration = 0;
    if (sessionId && activeSessions.has(sessionId)) {
        const session = activeSessions.get(sessionId);
        gameDuration = Math.round((Date.now() - session.startTime) / 1000); // in Sekunden
    }
    
    // Logge das abgeschlossene Spiel
    const userAgent = req.headers['user-agent'];
    logGame(username, category, gameDuration, score, totalQuestions, userAgent);
    
    res.json({ message: 'Spiel geloggt' });
});

// Hilfsfunktion für Kategorie-Anzeigenamen
function getCategoryDisplayName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.displayName : categoryId;
}

// Statische Dateien aus dem public Ordner servieren
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== ADMIN INTERFACE ====================

// Einfaches Token-System für Admin-Authentifizierung
const adminTokens = new Set();

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function verifyAdminToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token fehlt' });
    }

    const token = authHeader.substring(7);
    if (!adminTokens.has(token)) {
        return res.status(401).json({ error: 'Ungültiger Token' });
    }

    next();
}

// Admin Login
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        const token = generateToken();
        adminTokens.add(token);
        
        // Token läuft nach 24 Stunden ab
        setTimeout(() => {
            adminTokens.delete(token);
        }, 24 * 60 * 60 * 1000);
        
        res.json({ success: true, token });
        console.log('🔐 Admin-Login erfolgreich');
    } else {
        res.json({ success: false, message: 'Falsches Passwort' });
        console.log('⚠️ Fehlgeschlagener Admin-Login-Versuch');
    }
});

// Token-Verifikation
app.get('/admin/verify', verifyAdminToken, (req, res) => {
    res.json({ valid: true });
});

// Verfügbare Log-Monate abrufen
app.get('/admin/months', verifyAdminToken, (req, res) => {
    try {
        const logFiles = fs.readdirSync(LOG_DIR)
            .filter(file => file.startsWith('game-') && file.endsWith('.log'))
            .map(file => file.replace('game-', '').replace('.log', ''))
            .sort((a, b) => b.localeCompare(a)); // Neueste zuerst

        res.json({ months: logFiles });
    } catch (error) {
        console.error('Fehler beim Laden der Log-Monate:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Monate' });
    }
});

// Log-Daten für einen bestimmten Monat abrufen
app.get('/admin/logs/:month', verifyAdminToken, (req, res) => {
    const { month } = req.params;
    
    // Validiere Monatsformat (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: 'Ungültiges Monatsformat' });
    }
    
    const logFile = path.join(LOG_DIR, `game-${month}.log`);
    
    try {
        if (!fs.existsSync(logFile)) {
            return res.json({ logs: [] });
        }
        
        const logContent = fs.readFileSync(logFile, 'utf8');
        const logLines = logContent.trim().split('\n').filter(line => line.trim());
        
        const logs = logLines.map(line => {
            const [timestamp, username, category, duration, score, total, device, ...userAgentParts] = line.split('\t');
            return {
                timestamp,
                username,
                category,
                duration,
                score: parseInt(score),
                total: parseInt(total),
                device,
                userAgent: userAgentParts.join('\t')
            };
        });
        
        res.json({ logs });
    } catch (error) {
        console.error('Fehler beim Laden der Log-Datei:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Logs' });
    }
});

// Admin Interface HTML servieren
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ==================== END ADMIN INTERFACE ====================

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Quiz-Server läuft auf http://localhost:${PORT}`);
    console.log(`📁 Statische Dateien werden aus ./public serviert`);
    console.log(`🏆 Highscore-System mit persistenter Speicherung aktiviert`);
});
