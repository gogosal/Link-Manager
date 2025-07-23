// Variáveis globais
let links = JSON.parse(localStorage.getItem('links')) || [];
let sections = JSON.parse(localStorage.getItem('sections')) || [
    { id: 'geral', name: 'MAIN', icon: 'fas fa-home' }
];
let currentSection = localStorage.getItem('currentSection') || 'geral';
let draggedElement = null;
let draggedType = null; // 'card' ou 'section'

// Elementos do DOM
const addButton = document.getElementById('addButton');
const addModal = document.getElementById('addModal');
const sectionModal = document.getElementById('sectionModal');
const linkForm = document.getElementById('linkForm');
const sectionForm = document.getElementById('sectionForm');
const cardsContainer = document.getElementById('cardsContainer');
const sectionsContainer = document.querySelector('.sections-container');
const linkSectionSelect = document.getElementById('linkSection');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se a secção atual ainda existe
    const sectionExists = sections.some(section => section.id === currentSection);
    if (!sectionExists) {
        currentSection = 'geral';
        localStorage.setItem('currentSection', currentSection);
    }
    
    loadSections();
    loadCards();
    setupEventListeners();
});

function setupEventListeners() {
    // Botão adicionar
    addButton.addEventListener('click', () => {
        openModal(addModal);
        updateSectionSelect();
    });

    // Botão adicionar secção
    document.getElementById('addSectionBtn').addEventListener('click', () => {
        openModal(sectionModal);
    });

    // Botão deletar secção atual
    document.getElementById('deleteSectionBtn').addEventListener('click', () => {
        deleteCurrentSection();
    });

    // Fechar modais
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });

    // Cancelar modais
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModal(addModal);
    });

    document.getElementById('cancelSectionBtn').addEventListener('click', () => {
        closeModal(sectionModal);
    });

    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Formulários
    linkForm.addEventListener('submit', handleLinkSubmit);
    sectionForm.addEventListener('submit', handleSectionSubmit);
    
    // Configurar validação visual apenas
    setupCustomValidation();
}

// Configurar validação visual sem mensagens
function setupCustomValidation() {
    const linkTitle = document.getElementById('linkTitle');
    const linkUrl = document.getElementById('linkUrl');
    const sectionName = document.getElementById('sectionName');
    
    // Remover estado inválido quando o usuário digita
    [linkTitle, linkUrl, sectionName].forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('custom-invalid');
        });
        
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('custom-invalid');
            } else {
                this.classList.remove('custom-invalid');
            }
        });
    });
}

// Funções de modal
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    // Limpar formulários
    modal.querySelectorAll('form').forEach(form => form.reset());
}

// Carregar secções
function loadSections() {
    sectionsContainer.innerHTML = '';
    updateSectionSelect();
    
    sections.forEach((section, index) => {
        const sectionElement = createSectionElement(section, index);
        sectionsContainer.appendChild(sectionElement);
    });
    
    // Configurar drag and drop para secções
    setupSectionDragAndDrop();
    
    // Atualizar estado do botão delete
    updateDeleteSectionButton();
}

function createSectionElement(section, index) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = `section ${section.id === currentSection ? 'active' : ''}`;
    sectionDiv.dataset.section = section.id;
    sectionDiv.dataset.index = index;
    sectionDiv.draggable = true;
    
    sectionDiv.innerHTML = `
        <i class="${section.icon}"></i>
        <span>${section.name}</span>
    `;
    
    sectionDiv.addEventListener('click', (e) => {
        // Só trocar secção se não estiver a fazer drag
        if (!sectionDiv.classList.contains('dragging')) {
            switchSection(section.id);
        }
    });
    
    return sectionDiv;
}

function updateSectionSelect() {
    linkSectionSelect.innerHTML = '';
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section.id;
        option.textContent = section.name;
        if (section.id === currentSection) {
            option.selected = true;
        }
        linkSectionSelect.appendChild(option);
    });
}

// Trocar secção
function switchSection(sectionId) {
    currentSection = sectionId;
    
    // Salvar secção atual no localStorage
    localStorage.setItem('currentSection', currentSection);
    
    // Atualizar UI das secções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Atualizar estado do botão delete
    updateDeleteSectionButton();
    
    // Recarregar cards
    loadCards();
}

function updateDeleteSectionButton() {
    const deleteSectionBtn = document.getElementById('deleteSectionBtn');
    if (currentSection === 'geral') {
        deleteSectionBtn.disabled = true;
        deleteSectionBtn.title = 'Cannot delete MAIN sector';
    } else {
        deleteSectionBtn.disabled = false;
        deleteSectionBtn.title = 'Delete current sector';
    }
}// Carregar cards
function loadCards() {
    const sectionLinks = links.filter(link => link.section === currentSection);
    
    if (sectionLinks.length === 0) {
        cardsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-link"></i>
                <h3>NO LINKS DETECTED</h3>
                <p>CLICK THE + BUTTON TO ADD YOUR FIRST LINK</p>
            </div>
        `;
        return;
    }
    
    cardsContainer.innerHTML = '';
    sectionLinks.forEach((link, index) => {
        const card = createCard(link, index);
        cardsContainer.appendChild(card);
    });
    
    // Configurar drag and drop para cards
    setupCardDragAndDrop();
}

// Criar card
function createCard(link, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.linkId = link.id;
    card.dataset.index = index;
    card.draggable = true;

    const imageElement = link.image ?
        `<img src="${link.image}" alt="${link.title}">` :
        `<div class="preview"><i class="fas fa-external-link-alt"></i></div>`;

    card.innerHTML = `
        <div class="card-image ${link.image ? '' : 'preview'}">
            ${imageElement}
        </div>
        <div class="card-content">
            <h3 class="card-title">${link.title}</h3>
        </div>
        <button class="card-delete" onclick="deleteLink('${link.id}')">
            <i class="fas fa-trash"></i>
        </button>
    `;

    // Adicionar evento de clique para abrir link
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.card-delete')) {
            window.open(link.url, '_blank');
        }
    });

    return card;
}

// Manipular submissão do formulário de link
async function handleLinkSubmit(e) {
    e.preventDefault();

    const titleInput = document.getElementById('linkTitle');
    const urlInput = document.getElementById('linkUrl');
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    
    // Validação customizada sem mensagens
    let hasErrors = false;
    
    if (!title) {
        titleInput.classList.add('custom-invalid');
        hasErrors = true;
    } else {
        titleInput.classList.remove('custom-invalid');
    }
    
    if (!url) {
        urlInput.classList.add('custom-invalid');
        hasErrors = true;
    } else {
        urlInput.classList.remove('custom-invalid');
    }
    
    if (hasErrors) {
        return; // Para aqui se houver erros
    }

    const imageFile = document.getElementById('linkImage').files[0];
    const section = document.getElementById('linkSection').value;

    let imageDataUrl = null;

    // Se uma imagem foi selecionada, converter para base64
    if (imageFile) {
        imageDataUrl = await fileToDataUrl(imageFile);
    }

    const newLink = {
        id: Date.now().toString(),
        title,
        url: formatUrl(url),
        image: imageDataUrl,
        section,
        createdAt: new Date().toISOString()
    };

    links.push(newLink);
    saveToLocalStorage();

    // Se o link foi adicionado à secção atual, recarregar
    if (section === currentSection) {
        loadCards();
    }

    closeModal(addModal);
}

// Manipular submissão do formulário de secção
function handleSectionSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('sectionName');
    const name = nameInput.value.trim();
    
    // Validação customizada sem mensagens
    if (!name) {
        nameInput.classList.add('custom-invalid');
        return; // Para aqui se houver erro
    } else {
        nameInput.classList.remove('custom-invalid');
    }

    const icon = document.getElementById('sectionIcon').value;

    const newSection = {
        id: generateSectionId(name),
        name,
        icon
    };

    sections.push(newSection);
    saveToLocalStorage();
    loadSections();
    closeModal(sectionModal);
}

// Funções auxiliares
function formatUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

function generateSectionId(name) {
    return name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 20) + '-' + Date.now();
}

function fileToDataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function deleteLink(linkId) {
    if (confirm('CONFIRM LINK TERMINATION?')) {
        links = links.filter(link => link.id !== linkId);
        saveToLocalStorage();
        loadCards();
    }
}

function deleteSection(sectionId) {
    // Não permitir deletar a secção principal
    if (sectionId === 'geral') {
        alert('CANNOT DELETE MAIN SECTOR');
        return;
    }
    
    // Verificar se há links nesta secção
    const sectionLinks = links.filter(link => link.section === sectionId);
    
    if (sectionLinks.length > 0) {
        if (!confirm(`SECTOR CONTAINS ${sectionLinks.length} LINKS. DELETE ALL DATA?`)) {
            return;
        }
        // Remover todos os links da secção
        links = links.filter(link => link.section !== sectionId);
    } else {
        if (!confirm('CONFIRM SECTOR TERMINATION?')) {
            return;
        }
    }
    
    // Remover a secção
    sections = sections.filter(section => section.id !== sectionId);
    
    // Se a secção atual foi deletada, voltar à principal
    if (currentSection === sectionId) {
        currentSection = 'geral';
    }
    
    saveToLocalStorage();
    loadSections();
    loadCards();
}

function deleteCurrentSection() {
    // Não permitir deletar a secção principal
    if (currentSection === 'geral') {
        alert('CANNOT DELETE MAIN SECTOR');
        return;
    }
    
    const currentSectionData = sections.find(section => section.id === currentSection);
    const sectionName = currentSectionData ? currentSectionData.name : 'UNKNOWN';
    
    // Verificar se há links nesta secção
    const sectionLinks = links.filter(link => link.section === currentSection);
    
    let confirmMessage = `DELETE SECTOR "${sectionName}"?`;
    if (sectionLinks.length > 0) {
        confirmMessage = `DELETE SECTOR "${sectionName}"?\nWARNING: ${sectionLinks.length} LINKS WILL BE PERMANENTLY DELETED!`;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Remover todos os links da secção
    links = links.filter(link => link.section !== currentSection);
    
    // Remover a secção
    sections = sections.filter(section => section.id !== currentSection);
    
    // Voltar à secção principal
    currentSection = 'geral';
    localStorage.setItem('currentSection', currentSection);
    
    saveToLocalStorage();
    loadSections();
    loadCards();
}

function saveToLocalStorage() {
    localStorage.setItem('links', JSON.stringify(links));
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('currentSection', currentSection);
}// Funcionalidade de exportar/importar (opcional - para futuras melhorias)
function exportData() {
    const data = {
        links,
        sections,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'gestor-links-backup.json';
    link.click();

    URL.revokeObjectURL(url);
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.links && data.sections) {
                links = data.links;
                sections = data.sections;
                saveToLocalStorage();
                loadSections();
                loadCards();
                alert('DATA IMPORT SUCCESSFUL!');
            }
        } catch (error) {
            alert('DATA CORRUPTION ERROR: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Funções de Drag and Drop para Cards
function setupCardDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', handleCardDragStart);
        card.addEventListener('dragover', handleCardDragOver);
        card.addEventListener('drop', handleCardDrop);
        card.addEventListener('dragend', handleCardDragEnd);
    });
}

function handleCardDragStart(e) {
    draggedElement = this;
    draggedType = 'card';
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleCardDragOver(e) {
    if (draggedType === 'card' && this !== draggedElement) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }
}

function handleCardDrop(e) {
    if (draggedType === 'card' && this !== draggedElement) {
        e.preventDefault();
        
        const draggedId = draggedElement.dataset.linkId;
        const targetId = this.dataset.linkId;
        
        // Reordenar no array de links
        reorderCardsInSection(draggedId, targetId);
        
        // Recarregar cards
        loadCards();
    }
    this.classList.remove('drag-over');
}

function handleCardDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('drag-over');
    });
    draggedElement = null;
    draggedType = null;
}

function reorderCardsInSection(draggedId, targetId) {
    const sectionLinks = links.filter(link => link.section === currentSection);
    const otherLinks = links.filter(link => link.section !== currentSection);
    
    const draggedIndex = sectionLinks.findIndex(link => link.id === draggedId);
    const targetIndex = sectionLinks.findIndex(link => link.id === targetId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        // Remove o elemento arrastado
        const draggedLink = sectionLinks.splice(draggedIndex, 1)[0];
        
        // Insere na nova posição
        sectionLinks.splice(targetIndex, 0, draggedLink);
        
        // Reconstrói o array completo
        links = [...otherLinks, ...sectionLinks];
        saveToLocalStorage();
    }
}

// Funções de Drag and Drop para Secções
function setupSectionDragAndDrop() {
    const sectionElements = document.querySelectorAll('.section');
    
    sectionElements.forEach(section => {
        section.addEventListener('dragstart', handleSectionDragStart);
        section.addEventListener('dragover', handleSectionDragOver);
        section.addEventListener('drop', handleSectionDrop);
        section.addEventListener('dragend', handleSectionDragEnd);
    });
}

function handleSectionDragStart(e) {
    // Permitir drag em toda a secção, mas não se clicar no texto (para permitir seleção)
    if (!e.target.closest('span')) {
        draggedElement = this;
        draggedType = 'section';
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.outerHTML);
    } else {
        e.preventDefault();
    }
}

function handleSectionDragOver(e) {
    if (draggedType === 'section' && this !== draggedElement) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }
}

function handleSectionDrop(e) {
    if (draggedType === 'section' && this !== draggedElement) {
        e.preventDefault();
        
        const draggedSectionId = draggedElement.dataset.section;
        const targetSectionId = this.dataset.section;
        
        console.log('Reordering sections:', draggedSectionId, '->', targetSectionId);
        
        // Reordenar secções
        reorderSections(draggedSectionId, targetSectionId);
        
        // Recarregar secções
        loadSections();
    }
    this.classList.remove('drag-over');
}

function handleSectionDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('drag-over');
    });
    draggedElement = null;
    draggedType = null;
    
    // Pequeno delay para permitir o clique após o drag
    setTimeout(() => {
        this.style.pointerEvents = 'auto';
    }, 100);
}

function reorderSections(draggedSectionId, targetSectionId) {
    const draggedIndex = sections.findIndex(section => section.id === draggedSectionId);
    const targetIndex = sections.findIndex(section => section.id === targetSectionId);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
        // Remove a secção arrastada
        const draggedSection = sections.splice(draggedIndex, 1)[0];
        
        // Insere na nova posição
        sections.splice(targetIndex, 0, draggedSection);
        
        saveToLocalStorage();
    }
}
