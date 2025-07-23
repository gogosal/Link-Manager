/* ====================================
   DRAG AND DROP FUNCTIONALITY
   ==================================== */

/**
 * Handle card drag start
 * @param {DragEvent} e - Drag event
 */
function handleCardDragStart(e) {
    state.draggedElement = e.target;
    state.isDragging = true;

    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);

    console.log('Card drag started:', e.target.dataset.id);
}

/**
 * Handle card drag over
 * @param {DragEvent} e - Drag event
 */
function handleCardDragOver(e) {
    if (!state.isDragging) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const card = e.target.closest('.card');
    if (card && card !== state.draggedElement) {
        card.classList.add('drag-over');
    }
}

/**
 * Handle card drag leave
 * @param {DragEvent} e - Drag event
 */
function handleCardDragLeave(e) {
    const card = e.target.closest('.card');
    if (card) {
        card.classList.remove('drag-over');
    }
}

/**
 * Handle card drop
 * @param {DragEvent} e - Drag event
 */
function handleCardDrop(e) {
    e.preventDefault();

    const targetCard = e.target.closest('.card');
    if (!targetCard || !state.draggedElement || targetCard === state.draggedElement) {
        return;
    }

    const draggedId = state.draggedElement.dataset.id;
    const targetId = targetCard.dataset.id;

    console.log('Dropping card', draggedId, 'onto', targetId);

    // Find the links in current section
    const currentSectionLinks = state.links.filter(link => link.section === state.currentSection);
    const draggedIndex = currentSectionLinks.findIndex(link => link.id === draggedId);
    const targetIndex = currentSectionLinks.findIndex(link => link.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        // Remove dragged link from its position
        const [draggedLink] = currentSectionLinks.splice(draggedIndex, 1);

        // Insert at new position
        currentSectionLinks.splice(targetIndex, 0, draggedLink);

        // Update the main links array
        state.links = state.links.filter(link => link.section !== state.currentSection);
        state.links.push(...currentSectionLinks);

        // Save and refresh
        saveToLocalStorage();
        loadCards();

        showNotification('Card reordered successfully!', 'success');
    }

    // Clean up
    targetCard.classList.remove('drag-over');
}

/**
 * Handle card drag end
 * @param {DragEvent} e - Drag event
 */
function handleCardDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.card.drag-over').forEach(card => {
        card.classList.remove('drag-over');
    });

    state.draggedElement = null;
    state.isDragging = false;

    console.log('Card drag ended');
}

/**
 * Handle section drag start
 * @param {DragEvent} e - Drag event
 */
function handleSectionDragStart(e) {
    state.draggedElement = e.target;
    state.isDragging = true;

    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);

    console.log('Section drag started:', e.target.dataset.id);
}

/**
 * Handle section drag over
 * @param {DragEvent} e - Drag event
 */
function handleSectionDragOver(e) {
    if (!state.isDragging) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const section = e.target.closest('.section-item');
    if (section && section !== state.draggedElement) {
        section.style.transform = 'translateX(10px)';
    }
}

/**
 * Handle section drag leave
 * @param {DragEvent} e - Drag event
 */
function handleSectionDragLeave(e) {
    const section = e.target.closest('.section-item');
    if (section) {
        section.style.transform = '';
    }
}

/**
 * Handle section drop
 * @param {DragEvent} e - Drag event
 */
function handleSectionDrop(e) {
    e.preventDefault();

    const targetSection = e.target.closest('.section-item');
    if (!targetSection || !state.draggedElement || targetSection === state.draggedElement) {
        return;
    }

    const draggedId = state.draggedElement.dataset.id;
    const targetId = targetSection.dataset.id;

    console.log('Dropping section', draggedId, 'onto', targetId);

    const draggedIndex = state.sections.findIndex(section => section.id === draggedId);
    const targetIndex = state.sections.findIndex(section => section.id === targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
        // Reorder sections array
        const [draggedSection] = state.sections.splice(draggedIndex, 1);
        state.sections.splice(targetIndex, 0, draggedSection);

        // Save and refresh
        saveToLocalStorage();
        loadSections();

        showNotification('Sector reordered successfully!', 'success');
    }

    // Clean up
    targetSection.style.transform = '';
}

/**
 * Handle section drag end
 * @param {DragEvent} e - Drag event
 */
function handleSectionDragEnd(e) {
    e.target.style.opacity = '';
    document.querySelectorAll('.section-item').forEach(section => {
        section.style.transform = '';
    });

    state.draggedElement = null;
    state.isDragging = false;

    console.log('Section drag ended');
}

/**
 * Setup drag and drop for cards
 * @param {HTMLElement} card - Card element
 */
function setupCardDragAndDrop(card) {
    card.draggable = true;
    card.addEventListener('dragstart', handleCardDragStart);
    card.addEventListener('dragover', handleCardDragOver);
    card.addEventListener('dragleave', handleCardDragLeave);
    card.addEventListener('drop', handleCardDrop);
    card.addEventListener('dragend', handleCardDragEnd);
}

/**
 * Setup drag and drop for sections
 * @param {HTMLElement} section - Section element
 */
function setupSectionDragAndDrop(section) {
    section.draggable = true;
    section.addEventListener('dragstart', handleSectionDragStart);
    section.addEventListener('dragover', handleSectionDragOver);
    section.addEventListener('dragleave', handleSectionDragLeave);
    section.addEventListener('drop', handleSectionDrop);
    section.addEventListener('dragend', handleSectionDragEnd);
}
