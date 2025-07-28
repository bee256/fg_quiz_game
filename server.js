const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadQuestions } = require('./questions-loader');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fragendatenbank aus JSON-Dateien laden
console.log('🔄 Lade Fragendatenbank...');
const { questions, categories } = loadQuestions();

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
    
    const question = sessionQuestions[currentQuestionIndex];
    
    // Timer für diese Frage starten
    session.questionStartTime = Date.now();
    
    // Antwort nicht an Client senden
    const { correct, ...questionWithoutAnswer } = question;
    
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
    
    const question = sessionQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;
    
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
    
    // Antwort speichern
    session.answers.push({
        questionId: question.id,
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
        correctAnswer: question.correct,
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
    
    const question = sessionQuestions[currentQuestionIndex];
    
    // Zeit-Berechnung für Timeout
    const currentTime = Date.now();
    const questionTime = (currentTime - session.questionStartTime) / 1000;
    
    session.totalTimeSpent += QUESTION_TIME_LIMIT;
    
    // Antwort als falsch/timeout speichern
    session.answers.push({
        questionId: question.id,
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
        correctAnswer: question.correct,
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

// Hilfsfunktion für Kategorie-Anzeigenamen
function getCategoryDisplayName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.displayName : categoryId;
}

// Statische Dateien aus dem public Ordner servieren
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Quiz-Server läuft auf http://localhost:${PORT}`);
    console.log(`📁 Statische Dateien werden aus ./public serviert`);
});
