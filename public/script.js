class QuizGame {
    constructor() {
        this.baseURL = window.location.origin; // Automatisch die richtige Server-URL verwenden
        this.sessionId = null;
        this.currentQuestion = null;
        this.totalQuestions = 0;
        this.currentQuestionNumber = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.timeLimit = 30;
        this.timeLeft = 0;
        this.timer = null;
        this.questionStartTime = null;
        
        this.initializeElements();
        this.bindEvents();
        this.showCategorySelection();
        this.loadCategories();
    }
    
    initializeElements() {
        // Screens
        this.categoryScreen = document.getElementById('category-selection');
        this.quizScreen = document.getElementById('quiz-area');
        this.resultScreen = document.getElementById('result-screen');
        
        // Category container
        this.categoryGrid = document.querySelector('.category-grid');
        
        // Quiz elements
        this.questionText = document.getElementById('question-text');
        this.answerButtons = document.querySelectorAll('.answer-btn');
        this.nextButton = document.getElementById('next-btn');
        this.backToCategoriesButton = document.getElementById('back-to-categories');
        this.progressBar = document.getElementById('progress');
        
        // Score elements
        this.scoreDisplay = document.getElementById('score');
        this.questionCounter = document.getElementById('question-counter');
        
        // Timer elements
        this.createTimerElements();
        
        // Result elements
        this.finalScore = document.getElementById('final-score');
        this.resultMessage = document.getElementById('result-message');
        this.percentageText = document.getElementById('percentage-text');
        this.restartButton = document.getElementById('restart-quiz');
        this.newCategoryButton = document.getElementById('new-category');
        
        // Loading indicator
        this.createLoadingIndicator();
    }
    
    createTimerElements() {
        // Timer in die Score-Anzeige einfügen
        const timerElement = document.createElement('span');
        timerElement.id = 'timer-display';
        timerElement.textContent = 'Zeit: --';
        timerElement.style.cssText = `
            color: #4facfe;
            font-weight: bold;
            font-size: 1.1em;
        `;
        
        // Timer nach dem Score einfügen
        const scoreDisplay = document.querySelector('.score-display');
        scoreDisplay.appendChild(timerElement);
        
        this.timerDisplay = timerElement;
        
        // Timer-Balken in die Fragebox integrieren - wird später beim displayQuestion eingefügt
        this.createTimerBar();
    }
    
    createTimerBar() {
        // Timer-Bar-Styles hinzufügen
        const timerStyle = document.createElement('style');
        timerStyle.textContent = `
            .timer-container {
                margin-bottom: 20px;
                background: #f8f9fa;
                border-radius: 10px;
                padding: 12px;
                border: 2px solid #e9ecef;
            }
            
            .timer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .timer-label {
                font-weight: bold;
                color: #333;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.95em;
            }
            
            .timer-text {
                font-size: 1.1em;
                font-weight: bold;
                color: #4facfe;
                min-width: 35px;
                text-align: right;
            }
            
            .timer-text.warning {
                color: #ff9800;
            }
            
            .timer-text.danger {
                color: #f44336;
                animation: pulse 0.5s infinite alternate;
            }
            
            @keyframes pulse {
                from { opacity: 1; }
                to { opacity: 0.6; }
            }
            
            .timer-bar-track {
                width: 100%;
                height: 6px;
                background: #e0e0e0;
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }
            
            .timer-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
                border-radius: 3px;
                transition: width 1s linear, background 0.3s ease;
                width: 100%;
            }
            
            .timer-bar-fill.warning {
                background: linear-gradient(90deg, #ff9800 0%, #ffb74d 100%);
            }
            
            .timer-bar-fill.danger {
                background: linear-gradient(90deg, #f44336 0%, #ff5252 100%);
                animation: barPulse 0.5s infinite alternate;
            }
            
            @keyframes barPulse {
                from { opacity: 1; }
                to { opacity: 0.7; }
            }
            
            @media (max-width: 768px) {
                .timer-container {
                    padding: 10px;
                    margin-bottom: 15px;
                }
                
                .timer-header {
                    margin-bottom: 6px;
                }
                
                .timer-label {
                    font-size: 0.9em;
                    gap: 4px;
                }
                
                .timer-text {
                    font-size: 1em;
                    min-width: 30px;
                }
                
                .timer-bar-track {
                    height: 5px;
                }
            }
            
            @media (max-width: 480px) {
                .timer-container {
                    padding: 8px;
                    margin-bottom: 12px;
                }
                
                .timer-label {
                    font-size: 0.85em;
                }
                
                .timer-text {
                    font-size: 0.95em;
                }
                
                .timer-bar-track {
                    height: 4px;
                }
            }
        `;
        document.head.appendChild(timerStyle);
    }
    
    createLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Lade...</p>
        `;
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            z-index: 1000;
            display: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4facfe;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loadingDiv);
        this.loadingIndicator = loadingDiv;
    }
    
    showLoading() {
        this.loadingIndicator.style.display = 'block';
    }
    
    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }
    
    async loadCategories() {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseURL}/api/categories`);
            if (!response.ok) throw new Error('Fehler beim Laden der Kategorien');
            
            const data = await response.json();
            this.renderCategories(data.categories);
        } catch (error) {
            console.error('Fehler beim Laden der Kategorien:', error);
            this.showError('Fehler beim Laden der Kategorien. Bitte versuchen Sie es später erneut.');
        } finally {
            this.hideLoading();
        }
    }
    
    renderCategories(categories) {
        this.categoryGrid.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.dataset.category = category.id;
            
            // Icon und Name aus den Server-Metadaten verwenden
            const icon = category.icon || '📚';
            const name = category.name || category.id;
            const description = category.description || '';
            
            button.innerHTML = `
                <div class="category-icon">${icon}</div>
                <div class="category-name">${name}</div>
                ${description ? `<div class="category-description">${description}</div>` : ''}
            `;
            
            // Optional: Tooltip mit Beschreibung
            if (description) {
                button.title = description;
            }
            
            button.addEventListener('click', () => this.startQuiz(category.id));
            this.categoryGrid.appendChild(button);
        });
    }
    
    bindEvents() {
        // Answer buttons
        this.answerButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (!this.hasAnswered) {
                    this.selectAnswer(index);
                }
            });
        });
        
        // Control buttons
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.backToCategoriesButton.addEventListener('click', () => this.endSession());
        this.restartButton.addEventListener('click', () => this.restartQuiz());
        this.newCategoryButton.addEventListener('click', () => this.endSession());
    }
    
    showScreen(screenElement) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        screenElement.classList.add('active');
    }
    
    showCategorySelection() {
        this.showScreen(this.categoryScreen);
        this.resetGame();
    }
    
    async startQuiz(category) {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/api/quiz/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ category })
            });
            
            if (!response.ok) throw new Error('Fehler beim Starten des Quiz');
            
            const data = await response.json();
            this.sessionId = data.sessionId;
            this.totalQuestions = data.totalQuestions;
            this.timeLimit = data.timeLimit || 10;
            this.currentQuestionNumber = 0;
            this.score = 0;
            
            this.updateScore();
            this.updateQuestionCounter();
            this.showScreen(this.quizScreen);
            await this.loadNextQuestion();
            
        } catch (error) {
            console.error('Fehler beim Starten des Quiz:', error);
            this.showError('Fehler beim Starten des Quiz. Bitte versuchen Sie es erneut.');
        } finally {
            this.hideLoading();
        }
    }
    
    async loadNextQuestion() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/api/quiz/${this.sessionId}/question`);
            if (!response.ok) {
                if (response.status === 400) {
                    // Quiz beendet
                    await this.showResults();
                    return;
                }
                throw new Error('Fehler beim Laden der Frage');
            }
            
            const question = await response.json();
            this.currentQuestion = question;
            this.currentQuestionNumber = question.questionNumber;
            this.timeLimit = question.timeLimit || 10;
            this.questionStartTime = question.startTime;
            this.displayQuestion(question);
            
        } catch (error) {
            console.error('Fehler beim Laden der Frage:', error);
            this.showError('Fehler beim Laden der Frage.');
        } finally {
            this.hideLoading();
        }
    }
    
    displayQuestion(question) {
        this.questionText.textContent = question.question;
        
        // Timer-Container zur Fragebox hinzufügen
        this.addTimerToQuestion();
        
        // Reset answer buttons
        this.answerButtons.forEach((button, index) => {
            button.textContent = question.answers[index];
            button.className = 'answer-btn';
            button.disabled = false;
        });
        
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.nextButton.style.display = 'none';
        
        this.updateProgress();
        this.updateQuestionCounter();
        this.startTimer();
    }
    
    addTimerToQuestion() {
        // Entferne existierenden Timer falls vorhanden
        const existingTimer = document.querySelector('.timer-container');
        if (existingTimer) {
            existingTimer.remove();
        }
        
        // Erstelle neuen Timer-Container
        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-container';
        timerContainer.innerHTML = `
            <div class="timer-header">
                <div class="timer-label">
                    ⏱️ Verbleibende Zeit
                </div>
                <div class="timer-text" id="timer-seconds">10s</div>
            </div>
            <div class="timer-bar-track">
                <div class="timer-bar-fill" id="timer-bar"></div>
            </div>
        `;
        
        // Timer vor dem Fragetext einfügen
        const questionContainer = document.querySelector('.question-container');
        const questionText = document.getElementById('question-text');
        questionContainer.insertBefore(timerContainer, questionText);
        
        // Referenzen speichern
        this.timerBar = document.getElementById('timer-bar');
        this.timerSeconds = document.getElementById('timer-seconds');
    }
    
    startTimer() {
        this.timeLeft = this.timeLimit;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        // Timer-Container ausblenden oder entfernen ist nicht nötig, 
        // da er Teil der Frage ist
    }
    
    updateTimerDisplay() {
        if (!this.timerBar || !this.timerSeconds) return;
        
        // Text-Anzeigen aktualisieren
        this.timerSeconds.textContent = `${this.timeLeft}s`;
        this.timerDisplay.textContent = `Zeit: ${this.timeLeft}s`;
        
        // Timer-Balken aktualisieren
        const progress = (this.timeLeft / this.timeLimit) * 100;
        this.timerBar.style.width = `${progress}%`;
        
        // CSS-Klassen für Farben aktualisieren
        this.timerBar.classList.remove('warning', 'danger');
        this.timerSeconds.classList.remove('warning', 'danger');
        
        if (this.timeLeft <= 2) {
            this.timerBar.classList.add('danger');
            this.timerSeconds.classList.add('danger');
        } else if (this.timeLeft <= 5) {
            this.timerBar.classList.add('warning');
            this.timerSeconds.classList.add('warning');
        }
    }
    
    async handleTimeout() {
        if (this.hasAnswered) return;
        
        this.hasAnswered = true;
        this.stopTimer();
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/api/quiz/${this.sessionId}/timeout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Fehler beim Timeout-Handling');
            
            const result = await response.json();
            
            // Alle Buttons deaktivieren und richtige Antwort anzeigen
            this.answerButtons.forEach((button, buttonIndex) => {
                button.disabled = true;
                if (buttonIndex === result.correctAnswer) {
                    button.classList.add('correct');
                }
            });
            
            // Score aktualisieren
            this.score = result.score;
            this.updateScore();
            
            // Timeout-Nachricht anzeigen
            this.showTimeoutMessage();
            
            // Next button anzeigen
            if (result.isLastQuestion) {
                this.nextButton.textContent = 'Ergebnis anzeigen';
            } else {
                this.nextButton.textContent = 'Nächste Frage';
            }
            this.nextButton.style.display = 'block';
            
        } catch (error) {
            console.error('Fehler beim Timeout-Handling:', error);
            this.showError('Fehler beim Verarbeiten des Timeouts.');
        } finally {
            this.hideLoading();
        }
    }
    
    showTimeoutMessage() {
        // Temporäre Timeout-Nachricht anzeigen
        const message = document.createElement('div');
        message.textContent = '⏰ Zeit abgelaufen!';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff9800;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
            document.head.removeChild(style);
        }, 2000);
    }
    
    async selectAnswer(index) {
        if (this.hasAnswered) return;
        
        this.selectedAnswer = index;
        this.hasAnswered = true;
        this.stopTimer();
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/api/quiz/${this.sessionId}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answerIndex: index })
            });
            
            if (!response.ok) throw new Error('Fehler beim Übermitteln der Antwort');
            
            const result = await response.json();
            
            // Show correct/incorrect answers
            this.answerButtons.forEach((button, buttonIndex) => {
                button.disabled = true;
                
                if (buttonIndex === result.correctAnswer) {
                    button.classList.add('correct');
                } else if (buttonIndex === index && !result.correct) {
                    button.classList.add('incorrect');
                }
            });
            
            // Update score
            this.score = result.score;
            this.updateScore();
            
            // Zeige Punkte und Zeit-Bonus an
            if (result.timeBonus > 0) {
                this.showScoreBonus(result.points, result.timeBonus, result.timeSpent);
            }
            
            // Show next button or end quiz
            if (result.isLastQuestion) {
                this.nextButton.textContent = 'Ergebnis anzeigen';
            } else {
                this.nextButton.textContent = 'Nächste Frage';
            }
            this.nextButton.style.display = 'block';
            
        } catch (error) {
            console.error('Fehler beim Übermitteln der Antwort:', error);
            this.showError('Fehler beim Übermitteln der Antwort.');
        } finally {
            this.hideLoading();
        }
    }
    
    showScoreBonus(points, timeBonus, timeSpent) {
        const bonus = document.createElement('div');
        bonus.innerHTML = `
            <div class="score-popup">
                <div class="points">+${points} Punkte</div>
                <div class="time-info">Zeit: ${timeSpent.toFixed(1)}s</div>
                ${timeBonus > 0 ? `<div class="bonus">⚡ +${timeBonus} Zeitbonus!</div>` : ''}
            </div>
        `;
        
        bonus.style.cssText = `
            position: fixed;
            top: 20%;
            right: 15px;
            z-index: 1000;
            animation: slideInOut 3s ease-in-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .score-popup {
                background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 12px 16px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
                min-width: 120px;
            }
            
            .score-popup .points {
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .score-popup .time-info {
                font-size: 0.85em;
                opacity: 0.9;
            }
            
            .score-popup .bonus {
                font-size: 1em;
                font-weight: bold;
                color: #ffeb3b;
                margin-top: 4px;
            }
            
            @keyframes slideInOut {
                0% { transform: translateX(100%); opacity: 0; }
                20%, 80% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            
            @media (max-width: 768px) {
                .score-popup {
                    padding: 10px 12px;
                    border-radius: 10px;
                    min-width: 100px;
                }
                
                .score-popup .points {
                    font-size: 1.1em;
                }
                
                .score-popup .time-info {
                    font-size: 0.8em;
                }
                
                .score-popup .bonus {
                    font-size: 0.9em;
                }
            }
            
            @media (max-width: 480px) {
                .score-popup {
                    padding: 8px 10px;
                    right: 10px;
                    min-width: 90px;
                }
                
                .score-popup .points {
                    font-size: 1em;
                }
                
                .score-popup .time-info {
                    font-size: 0.75em;
                }
                
                .score-popup .bonus {
                    font-size: 0.85em;
                }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(bonus);
        
        setTimeout(() => {
            if (document.body.contains(bonus)) {
                document.body.removeChild(bonus);
                document.head.removeChild(style);
            }
        }, 3000);
    }
    
    async nextQuestion() {
        if (this.currentQuestionNumber >= this.totalQuestions) {
            await this.showResults();
        } else {
            await this.loadNextQuestion();
        }
    }
    
    async showResults() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/api/quiz/${this.sessionId}/result`);
            if (!response.ok) throw new Error('Fehler beim Laden der Ergebnisse');
            
            const result = await response.json();
            
            this.finalScore.textContent = `${result.score}/${result.totalPossibleScore} Punkte`;
            this.percentageText.textContent = `${result.scorePercentage}%`;
            
            // Erweiterte Statistiken anzeigen
            this.updateDetailedResults(result);
            
            // Update result message based on performance
            let message;
            if (result.scorePercentage >= 90) {
                message = "Ausgezeichnet! Du bist ein wahrer Experte! 🏆";
            } else if (result.scorePercentage >= 70) {
                message = "Sehr gut! Du kennst dich wirklich aus! 🌟";
            } else if (result.scorePercentage >= 50) {
                message = "Gut gemacht! Es gibt noch Raum für Verbesserungen. 👍";
            } else {
                message = "Nicht schlecht! Übung macht den Meister. 💪";
            }
            this.resultMessage.textContent = message;
            
            // Update percentage circle
            this.updatePercentageCircle(result.scorePercentage);
            
            this.showScreen(this.resultScreen);
            
        } catch (error) {
            console.error('Fehler beim Laden der Ergebnisse:', error);
            this.showError('Fehler beim Laden der Ergebnisse.');
        } finally {
            this.hideLoading();
        }
    }
    
    updateDetailedResults(result) {
        // Detaillierte Statistiken zur Ergebnis-Seite hinzufügen
        const existingStats = document.getElementById('detailed-stats');
        if (existingStats) {
            existingStats.remove();
        }
        
        const detailedStats = document.createElement('div');
        detailedStats.id = 'detailed-stats';
        detailedStats.innerHTML = `
            <div class="stats-container">
                <h3>📊 Detaillierte Statistiken</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${result.correctAnswers}</div>
                        <div class="stat-label">Richtige Antworten</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${result.timeBonus}</div>
                        <div class="stat-label">Zeitbonus-Punkte</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${result.totalTimeSpent}s</div>
                        <div class="stat-label">Gesamtzeit</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${result.avgTimePerQuestion}s</div>
                        <div class="stat-label">⌀ Zeit pro Frage</div>
                    </div>
                </div>
            </div>
        `;
        
        detailedStats.style.cssText = `
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
            border: 2px solid #e9ecef;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .stats-container h3 {
                text-align: center;
                margin-bottom: 20px;
                color: #333;
                font-size: 1.3em;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
            }
            
            .stat-item {
                text-align: center;
                padding: 15px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            
            .stat-number {
                font-size: 1.8em;
                font-weight: bold;
                color: #4facfe;
                margin-bottom: 5px;
            }
            
            .stat-label {
                font-size: 0.9em;
                color: #666;
                line-height: 1.2;
            }
        `;
        document.head.appendChild(style);
        
        // Stats nach der result-info einfügen
        const resultInfo = document.querySelector('.result-info');
        resultInfo.parentNode.insertBefore(detailedStats, resultInfo.nextSibling);
    }
    
    updatePercentageCircle(percentage) {
        const circle = document.querySelector('.percentage-circle');
        const degrees = (percentage / 100) * 360;
        circle.style.background = `conic-gradient(#4facfe ${degrees}deg, #e0e0e0 ${degrees}deg)`;
    }
    
    updateScore() {
        this.scoreDisplay.textContent = `Punkte: ${this.score}`;
    }
    
    updateQuestionCounter() {
        this.questionCounter.textContent = `Frage: ${this.currentQuestionNumber}/${this.totalQuestions}`;
    }
    
    updateProgress() {
        const progress = (this.currentQuestionNumber / this.totalQuestions) * 100;
        this.progressBar.style.width = `${progress}%`;
    }
    
    async restartQuiz() {
        if (this.sessionId) {
            await this.endSession();
        }
        // Restart mit derselben Kategorie - hier nehmen wir die letzte verwendete
        const lastCategory = this.categoryGrid.querySelector('.category-btn').dataset.category;
        await this.startQuiz(lastCategory);
    }
    
    async endSession() {
        this.stopTimer();
        if (this.sessionId) {
            try {
                await fetch(`${this.baseURL}/api/quiz/${this.sessionId}`, {
                    method: 'DELETE'
                });
            } catch (error) {
                console.error('Fehler beim Beenden der Session:', error);
            }
        }
        this.showCategorySelection();
    }
    
    resetGame() {
        this.stopTimer();
        
        // Timer-Container entfernen falls vorhanden
        const existingTimer = document.querySelector('.timer-container');
        if (existingTimer) {
            existingTimer.remove();
        }
        
        this.sessionId = null;
        this.currentQuestion = null;
        this.totalQuestions = 0;
        this.currentQuestionNumber = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.timeLimit = 30;
        this.timeLeft = 0;
        this.questionStartTime = null;
        this.timerBar = null;
        this.timerSeconds = null;
        
        this.scoreDisplay.textContent = 'Punkte: 0';
        this.questionCounter.textContent = 'Frage: 0/0';
        this.timerDisplay.textContent = 'Zeit: --';
        this.progressBar.style.width = '0%';
        this.nextButton.textContent = 'Nächste Frage';
        
        // Entferne detaillierte Statistiken falls vorhanden
        const existingStats = document.getElementById('detailed-stats');
        if (existingStats) {
            existingStats.remove();
        }
    }
    
    showError(message) {
        alert(message); // In einer Produktionsanwendung würde man ein schöneres Error-Modal verwenden
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});
