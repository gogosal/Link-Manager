/* ====================================
   UI RENDERING & MANAGEMENT
   ==================================== */

/**
 * Load and render cards for current section
 */
function loadCards() {
    if (!elements.cardsGrid) return;

    // Clear existing cards
    elements.cardsGrid.innerHTML = '';

    // Get links for current section
    const currentSectionLinks = state.links.filter(link => link.section === state.currentSection);

    if (currentSectionLinks.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div>NO ACTIVE CONNECTIONS</div>
            <small>Click "ADD CONNECTION" to establish your first link</small>
        `;
        elements.cardsGrid.appendChild(emptyState);
        return;
    }

    // Create cards
    currentSectionLinks.forEach(link => {
        const card = createCard(link);
        elements.cardsGrid.appendChild(card);
    });
}

/**
 * Create a card element for a link
 * @param {Object} link - Link data object
 * @returns {HTMLElement} Card element
 */
function createCard(link) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = link.id;

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';

    if (link.image) {
        const img = document.createElement('img');
        img.src = link.image;
        img.alt = link.title;
        img.onerror = () => {
            // Fallback to placeholder if image fails to load
            imageContainer.innerHTML = '🔗';
            imageContainer.classList.add('placeholder');
        };
        imageContainer.appendChild(img);
    } else {
        imageContainer.innerHTML = '🔗';
        imageContainer.classList.add('placeholder');
    }

    // Create content container
    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = `
        <h3>${sanitizeHtml(link.title)}</h3>
        <p title="${sanitizeHtml(link.url)}">${truncateText(link.url, 40)}</p>
    `;

    // Create actions container
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    actions.innerHTML = `
        <button onclick="window.editLink('${link.id}')" title="Edit Connection">✏️</button>
        <button onclick="window.deleteLink('${link.id}')" title="Delete Connection">🗑️</button>
    `;

    // Assemble card
    card.appendChild(imageContainer);
    card.appendChild(content);
    card.appendChild(actions);

    // Add click handler for opening link
    card.addEventListener('click', (e) => {
        // Don't open link if clicking on action buttons
        if (e.target.closest('.card-actions')) return;

        // Open link in new tab
        window.open(link.url, '_blank');
    });

    // Setup drag and drop
    setupCardDragAndDrop(card);

    return card;
}

/**
 * Load and render sections navigation
 */
function loadSections() {
    if (!elements.sectionsContainer) return;

    // Clear existing sections
    elements.sectionsContainer.innerHTML = '';

    // Create section elements
    state.sections.forEach(section => {
        const sectionElement = createSectionElement(section);
        elements.sectionsContainer.appendChild(sectionElement);
    });

    // Update section dropdown in forms
    populateSectionDropdown();
}

/**
 * Create a section navigation element
 * @param {Object} section - Section data object
 * @returns {HTMLElement} Section element
 */
function createSectionElement(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.dataset.id = section.id;

    // Add active class if current section
    if (section.id === state.currentSection) {
        sectionDiv.classList.add('active');
    }

    // Create section content
    const icon = document.createElement('i');
    icon.className = section.icon;

    const name = document.createElement('span');
    name.textContent = section.name;

    // Assemble section element
    sectionDiv.appendChild(icon);
    sectionDiv.appendChild(name);

    // Add click handler for section selection
    sectionDiv.addEventListener('click', (e) => {
        setCurrentSection(section.id);
    });

    // Setup drag and drop
    setupSectionDragAndDrop(sectionDiv);

    return sectionDiv;
}

/**
 * Set current active section
 * @param {string} sectionId - ID of section to activate
 */
function setCurrentSection(sectionId) {
    // Update state
    state.currentSection = sectionId;
    saveToLocalStorage();

    // Update UI
    loadSections();
    loadCards();
    updateDeleteSectionButton();

    console.log('Active section changed to:', sectionId);
}

/**
 * Delete a link
 * @param {string} linkId - ID of link to delete
 */
function deleteLink(linkId) {
    if (!confirm('⚠️ Delete this connection permanently?')) return;

    // Remove from state
    state.links = state.links.filter(link => link.id !== linkId);
    saveToLocalStorage();

    // Refresh UI
    loadCards();

    showNotification('Connection deleted successfully!', 'success');
}

/**
 * Delete a section
 * @param {string} sectionId - ID of section to delete
 */
function deleteSection(sectionId) {
    // Prevent deleting GERAL section
    if (sectionId === 'geral') {
        showNotification('Cannot delete MAIN sector', 'error');
        return;
    }

    // Prevent deleting the last section
    if (state.sections.length <= 1) {
        showNotification('Cannot delete the last sector', 'error');
        return;
    }

    const section = state.sections.find(s => s.id === sectionId);
    if (!section) return;

    // Count links in this section
    const linksInSection = state.links.filter(link => link.section === sectionId).length;

    let confirmMessage = `⚠️ Delete sector "${section.name}"?`;
    if (linksInSection > 0) {
        confirmMessage += ` This will also delete ${linksInSection} connection(s).`;
    }

    if (!confirm(confirmMessage)) return;

    // Remove section and its links
    state.sections = state.sections.filter(s => s.id !== sectionId);
    state.links = state.links.filter(link => link.section !== sectionId);

    // Change current section if deleting active section
    if (state.currentSection === sectionId) {
        state.currentSection = state.sections[0]?.id || CONFIG.DEFAULT_SECTION;
    }

    saveToLocalStorage();

    // Refresh UI
    loadSections();
    loadCards();
    updateDeleteSectionButton();

    showNotification('Sector deleted successfully!', 'success');
}

/**
 * Update page title based on current section
 */
function updatePageTitle() {
    const currentSection = state.sections.find(s => s.id === state.currentSection);
    const sectionName = currentSection ? currentSection.name : 'MAIN';
    document.title = `LINK MANAGER - ${sectionName}`;
}

/**
 * Update delete section button state
 */
function updateDeleteSectionButton() {
    if (!elements.deleteSectionBtn) return;

    const isGeralSection = state.currentSection === 'geral';

    if (isGeralSection) {
        elements.deleteSectionBtn.disabled = true;
        elements.deleteSectionBtn.title = 'Cannot delete MAIN sector';
        elements.deleteSectionBtn.style.opacity = '0.5';
        elements.deleteSectionBtn.style.cursor = 'not-allowed';
    } else {
        elements.deleteSectionBtn.disabled = false;
        elements.deleteSectionBtn.title = 'Delete current sector';
        elements.deleteSectionBtn.style.opacity = '1';
        elements.deleteSectionBtn.style.cursor = 'pointer';
    }
}
