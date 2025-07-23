/* ====================================
   MODAL MANAGEMENT
   ==================================== */

/**
 * Open modal with animation
 * @param {HTMLElement} modal - Modal element to open
 */
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Trigger animation
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });
}

/**
 * Close modal with animation
 * @param {HTMLElement} modal - Modal element to close
 */
function closeModal(modal) {
    modal.style.opacity = '0';

    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear all forms in the modal
        modal.querySelectorAll('form').forEach(form => {
            form.reset();
            // Remove validation classes
            form.querySelectorAll('.custom-invalid').forEach(input => {
                input.classList.remove('custom-invalid');
            });
        });

        // Reset edit mode if closing add modal
        if (modal.id === 'addModal') {
            if (window.editingLinkId) {
                window.editingLinkId = null;
                // Reset modal title
                const modalTitle = modal.querySelector('h2');
                if (modalTitle) modalTitle.textContent = '◢ NEW CONNECTION ◣';
            }
        }
    }, CONFIG.ANIMATION.MODAL_FADE);
}

/**
 * Setup modal event listeners
 */
function setupModalEventListeners() {
    // Close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Cancel buttons
    const cancelButtons = [
        { id: 'cancelBtn', modal: elements.addModal },
        { id: 'cancelSectionBtn', modal: elements.sectionModal }
    ];

    cancelButtons.forEach(({ id, modal }) => {
        const button = document.getElementById(id);
        if (button && modal) {
            button.addEventListener('click', () => closeModal(modal));
        }
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="block"]');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });
}

/**
 * Populate section dropdown in link form
 */
function populateSectionDropdown() {
    const select = document.getElementById('linkSection');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '';

    // Add sections as options
    state.sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;

        // Select current section by default
        if (section.id === state.currentSection) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

/**
 * Populate icon dropdown in section form
 */
function populateIconDropdown() {
    const select = document.getElementById('sectionIcon');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '';

    // Add icons as options
    CONFIG.SECTION_ICONS.forEach(icon => {
        const option = document.createElement('option');
        option.value = icon.value;
        option.textContent = icon.label;
        select.appendChild(option);
    });
}
