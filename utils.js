// Shared utilities for Quizlet Clone

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Get current study set
function getCurrentSet() {
    const setId = getUrlParameter('set');
    if (!setId) return null;
    
    const studySets = JSON.parse(localStorage.getItem('quizlet-study-sets') || '[]');
    return studySets.find(set => set.id == setId);
}

// Save current study set
function saveCurrentSet(studySet) {
    const studySets = JSON.parse(localStorage.getItem('quizlet-study-sets') || '[]');
    const index = studySets.findIndex(set => set.id === studySet.id);
    
    if (index !== -1) {
        studySets[index] = studySet;
    } else {
        studySets.push(studySet);
    }
    
    localStorage.setItem('quizlet-study-sets', JSON.stringify(studySets));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate random color
function getRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
        '#ff9a9e', '#fecfef', '#ffecd2', '#fcb69f'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Show notification with modern design
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const colors = {
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--primary)'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.25rem;">${icons[type]}</span>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 1000;
        animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        font-weight: 500;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Validate flashcard data
function validateFlashcard(term, definition) {
    if (!term || !term.trim()) {
        return { valid: false, message: 'Term is required' };
    }
    if (!definition || !definition.trim()) {
        return { valid: false, message: 'Definition is required' };
    }
    if (term.length > 200) {
        return { valid: false, message: 'Term is too long (max 200 characters)' };
    }
    if (definition.length > 500) {
        return { valid: false, message: 'Definition is too long (max 500 characters)' };
    }
    return { valid: true };
}

// Calculate study progress
function calculateProgress(studySet) {
    if (!studySet || !studySet.flashcards || studySet.flashcards.length === 0) {
        return 0;
    }
    
    // This is a simple implementation - you could add more sophisticated tracking
    const totalCards = studySet.flashcards.length;
    const studiedCards = studySet.flashcards.filter(card => card.lastStudied).length;
    
    return Math.round((studiedCards / totalCards) * 100);
}

// Generate study statistics
function generateStats(studySet) {
    if (!studySet || !studySet.flashcards) {
        return {
            totalCards: 0,
            studiedCards: 0,
            progress: 0,
            averageScore: 0,
            lastStudied: null
        };
    }
    
    const totalCards = studySet.flashcards.length;
    const studiedCards = studySet.flashcards.filter(card => card.lastStudied).length;
    const progress = Math.round((studiedCards / totalCards) * 100);
    
    // Calculate average score from test results
    const testResults = JSON.parse(localStorage.getItem(`test-results-${studySet.id}`) || '[]');
    const averageScore = testResults.length > 0 
        ? Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length)
        : 0;
    
    // Get last studied date
    const lastStudied = studySet.flashcards
        .filter(card => card.lastStudied)
        .sort((a, b) => new Date(b.lastStudied) - new Date(a.lastStudied))[0]?.lastStudied;
    
    return {
        totalCards,
        studiedCards,
        progress,
        averageScore,
        lastStudied
    };
}

// Save test results
function saveTestResult(studySetId, result) {
    const results = JSON.parse(localStorage.getItem(`test-results-${studySetId}`) || '[]');
    results.push({
        ...result,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(`test-results-${studySetId}`, JSON.stringify(results));
}

// Get test results
function getTestResults(studySetId) {
    return JSON.parse(localStorage.getItem(`test-results-${studySetId}`) || '[]');
}

// Mark card as studied
function markCardAsStudied(studySetId, cardId, correct = true) {
    const studySet = getCurrentSet();
    if (!studySet) return;
    
    const card = studySet.flashcards.find(c => c.id === cardId);
    if (card) {
        card.lastStudied = new Date().toISOString();
        card.studyCount = (card.studyCount || 0) + 1;
        card.correctCount = (card.correctCount || 0) + (correct ? 1 : 0);
        card.accuracy = Math.round((card.correctCount / card.studyCount) * 100);
    }
    
    saveCurrentSet(studySet);
}

// Get difficulty level for a card
function getCardDifficulty(card) {
    if (!card.studyCount || card.studyCount < 3) {
        return 'new';
    }
    
    const accuracy = card.accuracy || 0;
    if (accuracy >= 80) return 'easy';
    if (accuracy >= 60) return 'medium';
    return 'hard';
}

// Filter cards by difficulty
function filterCardsByDifficulty(studySet, difficulty) {
    if (!studySet || !studySet.flashcards) return [];
    
    if (difficulty === 'all') return studySet.flashcards;
    
    return studySet.flashcards.filter(card => getCardDifficulty(card) === difficulty);
}

// Create difficulty-based study session
function createStudySession(studySet, difficulty = 'all', maxCards = 20) {
    const cards = filterCardsByDifficulty(studySet, difficulty);
    const shuffled = shuffleArray(cards);
    return shuffled.slice(0, maxCards);
}

// Performance optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Smooth scroll to element
function smoothScrollTo(element, offset = 0) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        });
    }
}

// Add loading state to elements
function setLoadingState(element, isLoading = true) {
    if (element) {
        if (isLoading) {
            element.classList.add('loading');
            element.style.pointerEvents = 'none';
        } else {
            element.classList.remove('loading');
            element.style.pointerEvents = 'auto';
        }
    }
}

// Animate element entrance
function animateIn(element, delay = 0) {
    if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }
}

// Export functions for use in other files
window.QuizletUtils = {
    getUrlParameter,
    getCurrentSet,
    saveCurrentSet,
    escapeHtml,
    formatDate,
    shuffleArray,
    getRandomColor,
    showNotification,
    validateFlashcard,
    calculateProgress,
    generateStats,
    saveTestResult,
    getTestResults,
    markCardAsStudied,
    getCardDifficulty,
    filterCardsByDifficulty,
    createStudySession,
    debounce,
    throttle,
    smoothScrollTo,
    setLoadingState,
    animateIn
};
