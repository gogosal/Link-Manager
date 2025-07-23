/* ====================================
   DATA MANAGEMENT & LOCAL STORAGE
   ==================================== */

/**
 * Save current application state to localStorage
 */
function saveToLocalStorage() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.LINKS, JSON.stringify(state.links));
        localStorage.setItem(CONFIG.STORAGE_KEYS.SECTIONS, JSON.stringify(state.sections));
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_SECTION, state.currentSection);
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * Load application state from localStorage
 */
function loadFromLocalStorage() {
    try {
        // Load links
        const savedLinks = localStorage.getItem(CONFIG.STORAGE_KEYS.LINKS);
        if (savedLinks) {
            state.links = JSON.parse(savedLinks);
        }

        // Load sections
        const savedSections = localStorage.getItem(CONFIG.STORAGE_KEYS.SECTIONS);
        if (savedSections) {
            state.sections = JSON.parse(savedSections);
        }

        // Load current section
        const savedCurrentSection = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_SECTION);
        if (savedCurrentSection) {
            state.currentSection = savedCurrentSection;
        }

        // Ensure default section exists
        ensureDefaultSection();

    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        initializeDefaultData();
    }
}

/**
 * Ensure default section exists in the sections array
 */
function ensureDefaultSection() {
    // Check if GERAL section exists
    const geralExists = state.sections.some(section => section.id === CONFIG.DEFAULT_SECTION);
    
    if (!geralExists) {
        // Add GERAL section at the beginning
        state.sections.unshift(CONFIG.DEFAULT_SECTION_DATA);
        saveToLocalStorage();
        console.log('🔧 Restored missing GERAL section');
    }
    
    // Ensure we have at least one section
    if (state.sections.length === 0) {
        state.sections.push(CONFIG.DEFAULT_SECTION_DATA);
        saveToLocalStorage();
    }
    
    // Ensure current section exists
    const currentSectionExists = state.sections.some(section => section.id === state.currentSection);
    if (!currentSectionExists) {
        state.currentSection = CONFIG.DEFAULT_SECTION;
        saveToLocalStorage();
    }
}

/**
 * Initialize default application data
 */
function initializeDefaultData() {
    state.links = [];
    state.sections = [CONFIG.DEFAULT_SECTION_DATA];
    state.currentSection = CONFIG.DEFAULT_SECTION;
    saveToLocalStorage();
}

/**
 * Export all application data as JSON
 * @returns {string} JSON string containing all data
 */
function exportData() {
    const exportData = {
        links: state.links,
        sections: state.sections,
        currentSection: state.currentSection,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
}

/**
 * Import application data from JSON string
 * @param {string} jsonData - JSON string containing application data
 * @returns {boolean} Success status
 */
function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);

        // Validate required properties
        if (!Array.isArray(data.links) || !Array.isArray(data.sections)) {
            throw new Error('Invalid data format');
        }

        // Update state
        state.links = data.links;
        state.sections = data.sections;
        state.currentSection = data.currentSection || CONFIG.DEFAULT_SECTION;

        // Ensure default section exists
        ensureDefaultSection();

        // Save and refresh UI
        saveToLocalStorage();
        loadSections();
        loadCards();

        return true;
    } catch (error) {
        console.error('Failed to import data:', error);
        return false;
    }
}

/**
 * Clear all application data
 */
function clearAllData() {
    if (confirm('⚠️ This will delete all links and sections. Are you sure?')) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.LINKS);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SECTIONS);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_SECTION);

        initializeDefaultData();
        loadSections();
        loadCards();
    }
}
