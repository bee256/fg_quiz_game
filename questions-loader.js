const fs = require('fs');
const path = require('path');

/**
 * Lädt alle Fragenkategorien aus den JSON-Dateien im questions/ Verzeichnis
 * @returns {Object} Objekt mit allen Fragenkategorien und deren Metadaten
 */
function loadQuestions() {
    const questionsDir = path.join(__dirname, 'questions');
    const questions = {};
    const categories = [];
    
    // Überprüfen ob das questions-Verzeichnis existiert
    if (!fs.existsSync(questionsDir)) {
        throw new Error(`Questions-Verzeichnis nicht gefunden: ${questionsDir}`);
    }
    
    // Alle JSON-Dateien im questions-Verzeichnis laden
    const files = fs.readdirSync(questionsDir)
        .filter(file => file.endsWith('.json'))
        .sort(); // Sortierung nach Dateiname (berücksichtigt Präfixe)
    
    for (const file of files) {
        const filePath = path.join(questionsDir, file);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // Neue Struktur mit Metadaten unterstützen
            if (data.metadata && data.questions) {
                // Neue Struktur: { metadata: {...}, questions: [...] }
                const categoryId = data.metadata.categoryId;
                questions[categoryId] = data.questions;
                
                categories.push({
                    id: categoryId,
                    displayName: data.metadata.displayName,
                    description: data.metadata.description || '',
                    icon: data.metadata.icon || '📚',
                    order: data.metadata.order || 999,
                    fileName: file
                });
                
                console.log(`📚 Kategorie "${data.metadata.displayName}": ${data.questions.length} Fragen geladen (${file})`);
            } else if (Array.isArray(data)) {
                // Alte Struktur: direktes Array von Fragen
                const categoryId = path.basename(file, '.json').replace(/^\d+_/, ''); // Entferne Präfix
                questions[categoryId] = data;
                
                categories.push({
                    id: categoryId,
                    displayName: getCategoryDisplayNameFallback(categoryId),
                    description: `Fragen zur Kategorie ${categoryId}`,
                    icon: getCategoryIconFallback(categoryId),
                    order: 999,
                    fileName: file
                });
                
                console.log(`📚 Kategorie "${categoryId}": ${data.length} Fragen geladen (${file}) [Legacy-Format]`);
            } else {
                console.warn(`⚠️  Warnung: ${file} enthält keine gültigen Fragen-Struktur`);
            }
        } catch (error) {
            console.error(`❌ Fehler beim Laden von ${file}:`, error.message);
        }
    }
    
    // Kategorien nach order sortieren
    categories.sort((a, b) => a.order - b.order);
    
    console.log(`✅ Insgesamt ${Object.keys(questions).length} Kategorien geladen`);
    return { questions, categories };
}

/**
 * Fallback-Funktion für Anzeigenamen (Legacy-Unterstützung)
 */
function getCategoryDisplayNameFallback(categoryId) {
    const displayNames = {
        'friedrich-gymnasium': 'Friedrich-Gymnasium Freiburg',
        'allgemeinwissen': 'Allgemeinwissen',
        'geschichte': 'Geschichte',
        'wissenschaft': 'Wissenschaft',
        'sport': 'Sport',
        'geografie': 'Geografie',
        'kunst': 'Kunst & Kultur'
    };
    return displayNames[categoryId] || categoryId;
}

/**
 * Fallback-Funktion für Icons (Legacy-Unterstützung)
 */
function getCategoryIconFallback(categoryId) {
    const icons = {
        'friedrich-gymnasium': '🏫',
        'allgemeinwissen': '🌍',
        'geschichte': '🏛️',
        'wissenschaft': '🔬',
        'sport': '⚽',
        'geografie': '🗺️',
        'kunst': '🎨'
    };
    return icons[categoryId] || '📚';
}

/**
 * Lädt Fragen für eine spezifische Kategorie
 * @param {string} category - Name der Kategorie
 * @returns {Array} Array mit Fragen für die Kategorie
 */
function loadCategoryQuestions(category) {
    const filePath = path.join(__dirname, 'questions', `${category}.json`);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Kategorie "${category}" nicht gefunden: ${filePath}`);
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(`Fehler beim Laden der Kategorie "${category}": ${error.message}`);
    }
}

/**
 * Fügt eine neue Frage zu einer Kategorie hinzu
 * @param {string} category - Name der Kategorie
 * @param {Object} question - Neue Frage
 * @returns {boolean} Erfolg der Operation
 */
function addQuestionToCategory(category, question) {
    const filePath = path.join(__dirname, 'questions', `${category}.json`);
    
    try {
        let questions = [];
        
        // Existierende Fragen laden, falls die Datei existiert
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            questions = JSON.parse(content);
        }
        
        // Neue ID generieren
        const maxId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) : 0;
        question.id = maxId + 1;
        
        // Frage hinzufügen
        questions.push(question);
        
        // Datei aktualisieren
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 4));
        console.log(`✅ Neue Frage zu "${category}" hinzugefügt (ID: ${question.id})`);
        
        return true;
    } catch (error) {
        console.error(`❌ Fehler beim Hinzufügen der Frage:`, error.message);
        return false;
    }
}

module.exports = {
    loadQuestions,
    loadCategoryQuestions,
    addQuestionToCategory,
    getCategoryDisplayNameFallback,
    getCategoryIconFallback
};
