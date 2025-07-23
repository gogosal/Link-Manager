/* ====================================
   APPLICATION INITIALIZATION
   ==================================== */

/**
 * Initialize DOM element references
 */
function initializeElements() {
    // Modals
    elements.addModal = document.getElementById('addModal');
    elements.sectionModal = document.getElementById('sectionModal');

    // Forms
    elements.linkForm = document.getElementById('linkForm');
    elements.sectionForm = document.getElementById('sectionForm');

    // Containers
    elements.cardsGrid = document.querySelector('.cards-grid');
    elements.sectionsContainer = document.querySelector('.sections-container');

    // Buttons
    elements.addButton = document.querySelector('.add-btn');
    elements.addSectionBtn = document.getElementById('addSectionBtn');
    elements.deleteSectionBtn = document.getElementById('deleteSectionBtn');

    // Log missing elements for debugging
    Object.entries(elements).forEach(([key, element]) => {
        if (!element) {
            console.warn(`Element not found: ${key}`);
        }
    });
}

/**
 * Setup button event listeners
 */
function setupButtonEventListeners() {
    // Add connection button
    if (elements.addButton) {
        elements.addButton.addEventListener('click', () => {
            populateSectionDropdown();
            openModal(elements.addModal);
        });
    }

    // Add section button
    if (elements.addSectionBtn) {
        elements.addSectionBtn.addEventListener('click', () => {
            populateIconDropdown();
            openModal(elements.sectionModal);
        });
    }

    // Delete section button
    if (elements.deleteSectionBtn) {
        elements.deleteSectionBtn.addEventListener('click', () => {
            if (state.currentSection) {
                deleteSection(state.currentSection);
            }
        });
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N: New connection
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (elements.addModal) {
                populateSectionDropdown();
                openModal(elements.addModal);
            }
        }

        // Ctrl/Cmd + Shift + N: New section
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            if (elements.sectionModal) {
                populateIconDropdown();
                openModal(elements.sectionModal);
            }
        }

        // Ctrl/Cmd + E: Export data
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportApplicationData();
        }

        // Number keys 1-9: Switch sections
        if (e.key >= '1' && e.key <= '9') {
            const sectionIndex = parseInt(e.key) - 1;
            if (state.sections[sectionIndex]) {
                setCurrentSection(state.sections[sectionIndex].id);
            }
        }
    });
}

/**
 * Export application data to file
 */
function exportApplicationData() {
    try {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `cyberpunk-links-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Export failed', 'error');
    }
}

/**
 * Setup import functionality
 */
function setupImportFunctionality() {
    // Create hidden file input for import
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json';
    importInput.style.display = 'none';

    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const success = importData(e.target.result);
                if (success) {
                    showNotification('Data imported successfully!', 'success');
                } else {
                    showNotification('Import failed - invalid file format', 'error');
                }
            } catch (error) {
                console.error('Import failed:', error);
                showNotification('Import failed', 'error');
            }
        };
        reader.readAsText(file);
    });

    document.body.appendChild(importInput);

    // Add import functionality to a button if it exists
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });
    }
}

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('🚀 Initializing Cyberpunk Link Manager...');

    // Initialize DOM elements
    initializeElements();

    // Load data from localStorage
    loadFromLocalStorage();

    // Setup event listeners
    setupButtonEventListeners();
    setupModalEventListeners();
    setupFormEventListeners();
    setupKeyboardShortcuts();
    setupImportFunctionality();

    // Initial UI render
    ensureDefaultSection(); // Restore GERAL if missing
    loadSections();
    loadCards();
    updatePageTitle();
    updateDeleteSectionButton();

    console.log('✅ Application initialized successfully!');
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Reload data when page becomes visible (in case it changed in another tab)
        loadFromLocalStorage();
        loadSections();
        loadCards();
        updatePageTitle();
    }
});

// Handle before unload (save any pending changes)
window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});

// Make functions globally available for inline event handlers
window.deleteLink = deleteLink;
window.deleteSection = deleteSection;
