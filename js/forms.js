/* ====================================
   FORM VALIDATION & SUBMISSION
   ==================================== */

// Edit mode tracking
let editingLinkId = null;
window.editingLinkId = editingLinkId;

/**
 * Setup custom validation for form inputs
 */
function setupCustomValidation() {
    const inputs = [
        document.getElementById('linkTitle'),
        document.getElementById('linkUrl'),
        document.getElementById('sectionName')
    ].filter(Boolean);

    inputs.forEach(input => {
        // Remove invalid state when user types
        input.addEventListener('input', function () {
            this.classList.remove('custom-invalid');
        });

        // Validate on blur
        input.addEventListener('blur', function () {
            if (this.value.trim() === '') {
                this.classList.add('custom-invalid');
            } else {
                this.classList.remove('custom-invalid');
            }
        });
    });
}

/**
 * Validate form input
 * @param {HTMLInputElement} input - Input element to validate
 * @param {boolean} required - Whether the field is required
 * @returns {boolean} Validation result
 */
function validateInput(input, required = true) {
    const value = input.value.trim();
    let isValid = true;

    if (required && !value) {
        input.classList.add('custom-invalid');
        isValid = false;
    } else {
        input.classList.remove('custom-invalid');

        // Special validation for URL fields
        if (input.type === 'url' && value && !isValidUrl(value)) {
            input.classList.add('custom-invalid');
            isValid = false;
        }
    }

    return isValid;
}

/**
 * Handle link form submission
 * @param {Event} e - Submit event
 */
async function handleLinkSubmit(e) {
    e.preventDefault();

    const titleInput = document.getElementById('linkTitle');
    const urlInput = document.getElementById('linkUrl');
    const imageInput = document.getElementById('linkImage');
    const sectionSelect = document.getElementById('linkSection');

    // Validate inputs
    const isTitleValid = validateInput(titleInput, true);
    const isUrlValid = validateInput(urlInput, true);

    if (!isTitleValid || !isUrlValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const imageFile = imageInput.files[0];
    const section = sectionSelect.value;

    let imageDataUrl = null;

    // Convert image to base64 if provided
    if (imageFile) {
        try {
            imageDataUrl = await fileToDataUrl(imageFile);
        } catch (error) {
            console.error('Failed to process image:', error);
            showNotification('Failed to process image', 'error');
            return;
        }
    }

    // Create or update link object
    if (editingLinkId) {
        // Update existing link
        const linkIndex = state.links.findIndex(link => link.id === editingLinkId);
        if (linkIndex !== -1) {
            state.links[linkIndex] = {
                ...state.links[linkIndex],
                title: sanitizeHtml(title),
                url: formatUrl(url),
                image: imageDataUrl || state.links[linkIndex].image,
                section,
                updatedAt: new Date().toISOString()
            };
        }
        editingLinkId = null;
        window.editingLinkId = null;
    } else {
        // Create new link
        const newLink = {
            id: Date.now().toString(),
            title: sanitizeHtml(title),
            url: formatUrl(url),
            image: imageDataUrl,
            section,
            createdAt: new Date().toISOString()
        };
        state.links.push(newLink);
    }
    saveToLocalStorage();

    // Refresh UI if link belongs to current section
    if (section === state.currentSection) {
        loadCards();
    }

    // Close modal and show success message
    closeModal(elements.addModal);
    const message = editingLinkId ? 'Connection updated successfully!' : 'Connection established successfully!';
    showNotification(message, 'success');
    
    // Reset modal title
    const modalTitle = document.querySelector('#addModal h2');
    if (modalTitle) modalTitle.textContent = '◢ NEW CONNECTION ◣';
}

/**
 * Handle section form submission
 * @param {Event} e - Submit event
 */
function handleSectionSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('sectionName');
    const iconSelect = document.getElementById('sectionIcon');

    // Validate input
    const isNameValid = validateInput(nameInput, true);

    if (!isNameValid) {
        showNotification('Please enter a sector name', 'error');
        return;
    }

    const name = nameInput.value.trim();
    const icon = iconSelect.value;

    // Check for duplicate names
    const duplicateSection = state.sections.find(section =>
        section.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateSection) {
        nameInput.classList.add('custom-invalid');
        showNotification('Sector name already exists', 'error');
        return;
    }

    // Create new section object
    const newSection = {
        id: generateSectionId(name),
        name: sanitizeHtml(name.toUpperCase()),
        icon
    };

    // Add to state and save
    state.sections.push(newSection);
    saveToLocalStorage();

    // Refresh UI
    loadSections();
    populateSectionDropdown();

    // Close modal and show success message
    closeModal(elements.sectionModal);
    showNotification('Sector created successfully!', 'success');
}

/**
 * Setup form event listeners
 */
function setupFormEventListeners() {
    // Form submissions
    if (elements.linkForm) {
        elements.linkForm.addEventListener('submit', handleLinkSubmit);
    }

    if (elements.sectionForm) {
        elements.sectionForm.addEventListener('submit', handleSectionSubmit);
    }

    // Setup custom validation
    setupCustomValidation();
}

/**
 * Edit an existing link
 * @param {string} linkId - ID of link to edit
 */
function editLink(linkId) {
    const link = state.links.find(l => l.id === linkId);
    if (!link) {
        showNotification('Link not found', 'error');
        return;
    }

    // Set edit mode
    editingLinkId = linkId;
    window.editingLinkId = linkId;

    // Populate form with existing data
    const titleInput = document.getElementById('linkTitle');
    const urlInput = document.getElementById('linkUrl');
    const sectionSelect = document.getElementById('linkSection');
    const modalTitle = document.querySelector('#addModal h2');
    
    if (titleInput) titleInput.value = link.title;
    if (urlInput) urlInput.value = link.url;
    if (sectionSelect) sectionSelect.value = link.section;
    if (modalTitle) modalTitle.textContent = '◢ EDIT CONNECTION ◣';

    // Open modal
    openModal(elements.addModal);
}

// Make editLink available globally
window.editLink = editLink;
