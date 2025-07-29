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
        this.currentCategory = null;
        this.username = localStorage.getItem('quizUsername') || 'Gast';
        this.categories = [];
        
        this.initializeElements();
        this.bindEvents();
        this.updateUsernameDisplay();
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
        
        // User elements
        this.currentUserDisplay = document.getElementById('current-user');
        this.changeUsernameButton = document.getElementById('change-username');
        this.viewHighscoresButton = document.getElementById('view-highscores');
        
        // Modals
        this.usernameModal = document.getElementById('username-modal');
        this.usernameInput = document.getElementById('username-input');
        this.saveUsernameButton = document.getElementById('save-username');
        this.cancelUsernameButton = document.getElementById('cancel-username');
        
        this.highscoreModal = document.getElementById('highscore-modal');
        this.highscoreCategoriesContainer = document.querySelector('.highscore-categories');
        this.highscoreList = document.querySelector('.highscore-list');
        this.closeHighscoreButton = document.getElementById('close-highscore');
        
        // Info modals
        this.aboutModal = document.getElementById('about-modal');
        this.helpModal = document.getElementById('help-modal');
        this.privacyModal = document.getElementById('privacy-modal');
        this.closeAboutButton = document.getElementById('close-about');
        this.closeHelpButton = document.getElementById('close-help');
        this.closePrivacyButton = document.getElementById('close-privacy');
        
        // Footer links
        this.showAboutButton = document.getElementById('show-about');
        this.showHelpButton = document.getElementById('show-help');
        this.showPrivacyButton = document.getElementById('show-privacy');
        
        // Timer elements
        this.createTimerElements();
        
        // Result elements
        this.finalScore = document.getElementById('final-score');
        this.resultMessage = document.getElementById('result-message');
        this.percentageText = document.getElementById('percentage-text');
        this.restartButton = document.getElementById('restart-quiz');
        this.newCategoryButton = document.getElementById('new-category');
        this.viewCategoryHighscoreButton = document.getElementById('view-category-highscore');
        this.highscoreAchievement = document.getElementById('highscore-achievement');
        
        // Loading indicator
        this.createLoadingIndicator();
    }
    
    createTimerElements() {
        // Nur Timer-Balken erstellen, keine Zeitanzeige im Header
        this.timerDisplay = null; // Keine Header-Zeitanzeige mehr
        
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
                font-size: 1em;
            }
            
            .timer-text {
                font-size: 1.2em;
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
                    padding: 8px;
                    margin-bottom: 12px;
                }
                
                .timer-header {
                    margin-bottom: 6px;
                }
                
                .timer-label {
                    font-size: 0.95em;
                    gap: 4px;
                }
                
                .timer-text {
                    font-size: 1.1em;
                    min-width: 30px;
                }
                
                .timer-bar-track {
                    height: 5px;
                }
            }
            
            @media (max-width: 480px) {
                .timer-container {
                    padding: 6px;
                    margin-bottom: 10px;
                }
                
                .timer-label {
                    font-size: 0.9em;
                }
                
                .timer-text {
                    font-size: 1em;
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
            this.categories = data.categories; // Store categories for highscore use
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
        this.viewCategoryHighscoreButton.addEventListener('click', () => this.showHighscores(this.currentCategory));
        
        // User management
        this.changeUsernameButton.addEventListener('click', () => this.showUsernameModal());
        this.viewHighscoresButton.addEventListener('click', () => this.showHighscores());
        
        // Username modal
        this.saveUsernameButton.addEventListener('click', () => this.saveUsername());
        this.cancelUsernameButton.addEventListener('click', () => this.hideUsernameModal());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveUsername();
        });
        
        // Highscore modal
        this.closeHighscoreButton.addEventListener('click', () => this.hideHighscoreModal());
        
        // Info modals
        if (this.showAboutButton) this.showAboutButton.addEventListener('click', () => this.showAboutModal());
        if (this.showHelpButton) this.showHelpButton.addEventListener('click', () => this.showHelpModal());
        if (this.showPrivacyButton) this.showPrivacyButton.addEventListener('click', () => this.showPrivacyModal());
        if (this.closeAboutButton) this.closeAboutButton.addEventListener('click', () => this.hideAboutModal());
        if (this.closeHelpButton) this.closeHelpButton.addEventListener('click', () => this.hideHelpModal());
        if (this.closePrivacyButton) this.closePrivacyButton.addEventListener('click', () => this.hidePrivacyModal());
        
        // Modal background clicks
        this.usernameModal.addEventListener('click', (e) => {
            if (e.target === this.usernameModal) this.hideUsernameModal();
        });
        this.highscoreModal.addEventListener('click', (e) => {
            if (e.target === this.highscoreModal) this.hideHighscoreModal();
        });
        if (this.aboutModal) {
            this.aboutModal.addEventListener('click', (e) => {
                if (e.target === this.aboutModal) this.hideAboutModal();
            });
        }
        if (this.helpModal) {
            this.helpModal.addEventListener('click', (e) => {
                if (e.target === this.helpModal) this.hideHelpModal();
            });
        }
        if (this.privacyModal) {
            this.privacyModal.addEventListener('click', (e) => {
                if (e.target === this.privacyModal) this.hidePrivacyModal();
            });
        }
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
            this.currentCategory = category; // Store current category
            
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
        
        // Nur Timer-Balken und Balken-Text aktualisieren (keine Header-Anzeige mehr)
        this.timerSeconds.textContent = `${this.timeLeft}s`;
        
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
                font-size: 1.3em;
                font-weight: bold;
                margin-bottom: 4px;
            }
            
            .score-popup .time-info {
                font-size: 0.9em;
                opacity: 0.9;
            }
            
            .score-popup .bonus {
                font-size: 1.1em;
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
                    padding: 8px 10px;
                    border-radius: 10px;
                    min-width: 100px;
                }
                
                .score-popup .points {
                    font-size: 1.2em;
                }
                
                .score-popup .time-info {
                    font-size: 0.85em;
                }
                
                .score-popup .bonus {
                    font-size: 1em;
                }
            }
            
            @media (max-width: 480px) {
                .score-popup {
                    padding: 6px 8px;
                    right: 10px;
                    min-width: 90px;
                }
                
                .score-popup .points {
                    font-size: 1.1em;
                }
                
                .score-popup .time-info {
                    font-size: 0.8em;
                }
                
                .score-popup .bonus {
                    font-size: 0.95em;
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
            
            // Check and save highscore
            const isNewHighscore = await this.saveHighscore(this.currentCategory, result.score, result.totalPossibleScore);
            if (isNewHighscore && this.username !== 'Gast') {
                this.highscoreAchievement.style.display = 'block';
            } else {
                this.highscoreAchievement.style.display = 'none';
            }
            
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
            
            // Add username motivation if playing as guest
            if (this.username === 'Gast') {
                message += "\n\n💡 Tipp: Gib einen Benutzernamen ein, um in der Highscore-Liste zu erscheinen!";
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
        // Keine Header-Zeitanzeige mehr zu resetten
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
    
    // User Management Methods
    updateUsernameDisplay() {
        this.currentUserDisplay.textContent = this.username;
    }
    
    showUsernameModal() {
        this.usernameInput.value = this.username === 'Gast' ? '' : this.username;
        this.usernameModal.style.display = 'block';
        this.usernameInput.focus();
    }
    
    hideUsernameModal() {
        this.usernameModal.style.display = 'none';
    }
    
    saveUsername() {
        const newUsername = this.usernameInput.value.trim();
        if (newUsername && newUsername.length <= 20) {
            this.username = newUsername;
            localStorage.setItem('quizUsername', this.username);
            this.updateUsernameDisplay();
            this.hideUsernameModal();
        } else if (newUsername.length > 20) {
            alert('Der Name darf maximal 20 Zeichen lang sein.');
        } else {
            this.username = 'Gast';
            localStorage.removeItem('quizUsername');
            this.updateUsernameDisplay();
            this.hideUsernameModal();
        }
    }
    
    // Highscore Methods
    async showHighscores(selectedCategory = null) {
        this.highscoreModal.style.display = 'block';
        this.renderHighscoreCategories(selectedCategory);
        if (selectedCategory) {
            await this.loadHighscores(selectedCategory);
        } else if (this.categories.length > 0) {
            await this.loadHighscores(this.categories[0].id);
        }
    }
    
    hideHighscoreModal() {
        this.highscoreModal.style.display = 'none';
    }
    
    // Info Modal Methods
    showAboutModal() {
        if (this.aboutModal) {
            this.aboutModal.style.display = 'block';
        }
    }
    
    hideAboutModal() {
        if (this.aboutModal) {
            this.aboutModal.style.display = 'none';
        }
    }
    
    showHelpModal() {
        if (this.helpModal) {
            this.helpModal.style.display = 'block';
        }
    }
    
    hideHelpModal() {
        if (this.helpModal) {
            this.helpModal.style.display = 'none';
        }
    }
    
    showPrivacyModal() {
        if (this.privacyModal) {
            this.privacyModal.style.display = 'block';
        }
    }
    
    hidePrivacyModal() {
        if (this.privacyModal) {
            this.privacyModal.style.display = 'none';
        }
    }
    
    renderHighscoreCategories(selectedCategory = null) {
        this.highscoreCategoriesContainer.innerHTML = '';
        
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-tab';
            button.textContent = `${category.icon} ${category.name}`;
            button.dataset.category = category.id;
            
            if (selectedCategory === category.id || (!selectedCategory && category === this.categories[0])) {
                button.classList.add('active');
            }
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                button.classList.add('active');
                this.loadHighscores(category.id);
            });
            
            this.highscoreCategoriesContainer.appendChild(button);
        });
    }
    
    async loadHighscores(category) {
        try {
            const response = await fetch(`${this.baseURL}/api/highscores/${category}`);
            if (!response.ok) throw new Error('Fehler beim Laden der Highscores');
            
            const data = await response.json();
            this.renderHighscores(data.highscores || []);
        } catch (error) {
            console.error('Fehler beim Laden der Highscores:', error);
            this.renderHighscores([]);
        }
    }
    
    renderHighscores(highscores) {
        this.highscoreList.innerHTML = '';
        
        if (highscores.length === 0) {
            this.highscoreList.innerHTML = `
                <div class="no-highscores">
                    Noch keine Highscores vorhanden.<br>
                    Sei der Erste und spiele ein Quiz!
                </div>
            `;
            return;
        }
        
        highscores.forEach((score, index) => {
            const item = document.createElement('div');
            item.className = 'highscore-item';
            
            if (score.username === this.username) {
                item.classList.add('current-user');
            }
            
            let rank = index + 1;
            let rankDisplay = rank;
            if (rank === 1) rankDisplay = '🥇';
            else if (rank === 2) rankDisplay = '🥈';
            else if (rank === 3) rankDisplay = '🥉';
            
            item.innerHTML = `
                <span class="highscore-rank">${rankDisplay}</span>
                <span class="highscore-name">${score.username}</span>
                <span class="highscore-score">${score.score}/${score.totalQuestions}</span>
            `;
            
            this.highscoreList.appendChild(item);
        });
    }
    
    async saveHighscore(category, score, totalQuestions) {
        if (this.username === 'Gast') return false;
        
        try {
            const response = await fetch(`${this.baseURL}/api/highscores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    category: category,
                    score: score,
                    totalQuestions: totalQuestions
                })
            });
            
            if (!response.ok) throw new Error('Fehler beim Speichern des Highscores');
            
            const data = await response.json();
            return data.isNewHighscore;
        } catch (error) {
            console.error('Fehler beim Speichern des Highscores:', error);
            return false;
        }
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuizGame();
});
