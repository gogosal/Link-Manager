/* ====================================
   APPLICATION CONFIG & CONSTANTS
   ==================================== */

// Application configuration
const CONFIG = {
    // Default section when no sections exist
    DEFAULT_SECTION: 'geral',

    // Default section data
    DEFAULT_SECTION_DATA: {
        id: 'geral',
        name: 'MAIN',
        icon: 'fas fa-home'
    },

    // Local storage keys
    STORAGE_KEYS: {
        LINKS: 'links',
        SECTIONS: 'sections',
        CURRENT_SECTION: 'currentSection'
    },

    // Available section icons
    SECTION_ICONS: [
        { value: 'fas fa-folder', label: '📁 DATA' },
        { value: 'fas fa-star', label: '⭐ PRIORITY' },
        { value: 'fas fa-heart', label: '❤️ PERSONAL' },
        { value: 'fas fa-bookmark', label: '🔖 ARCHIVE' },
        { value: 'fas fa-tag', label: '🏷️ TAGGED' },
        { value: 'fas fa-briefcase', label: '💼 WORK' },
        { value: 'fas fa-gamepad', label: '🎮 GAMES' },
        { value: 'fas fa-book', label: '📚 DOCS' },
        { value: 'fas fa-music', label: '🎵 MEDIA' },
        { value: 'fas fa-cog', label: '⚙️ TOOLS' },
        { value: 'fas fa-shield-alt', label: '🛡️ SECURITY' },
        { value: 'fas fa-rocket', label: '🚀 PROJECTS' }
    ],

    // Animation durations
    ANIMATION: {
        MODAL_FADE: 300,
        CARD_HOVER: 300,
        DRAG_TRANSITION: 150
    }
};

// Application state
let state = {
    links: [],
    sections: [],
    currentSection: CONFIG.DEFAULT_SECTION,
    draggedElement: null,
    isDragging: false
};

// DOM element references (will be populated on DOM ready)
let elements = {
    // Modals
    addModal: null,
    sectionModal: null,

    // Forms
    linkForm: null,
    sectionForm: null,

    // Containers
    cardsGrid: null,
    sectionsContainer: null,

    // Buttons
    addButton: null,
    addSectionBtn: null,
    deleteSectionBtn: null
};
