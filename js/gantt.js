document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const DAYS_TO_SHOW = 365 * 2;
    const MIN_DAY_WIDTH = 45;
    const MAX_DAY_WIDTH = 150;
    let currentDayWidth = 90; // DAY_WIDTH initial
    let tasks = [];
    let selectedTask = null;
    let expandedDescriptions = new Set();
    let isResizing = false;
    let originalWidth;
    let originalX;
    let dragStartIndex;
    let dragEndIndex;
    const MIN_SIDEBAR_WIDTH = 200;
    const MAX_SIDEBAR_WIDTH = 800;

    // Éléments DOM
    const taskList = document.getElementById('taskList');
    const timelineHeader = document.getElementById('timelineHeader');
    const timelineContent = document.getElementById('timelineContent');
    const modal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const modalTitle = document.getElementById('modalTitle');
    const newTaskBtn = document.getElementById('newTaskBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const closeBtn = document.querySelector('.close');

    // Date de début de vue (premier jour du mois courant)
    const viewStartDate = new Date();
    viewStartDate.setDate(1);
    viewStartDate.setHours(0, 0, 0, 0);





    function addDragAndDropHandlers() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(task => {
            // Ajouter l'attribut draggable
            task.setAttribute('draggable', true);
            
            task.addEventListener('dragstart', dragStart);
            task.addEventListener('dragover', dragOver);
            task.addEventListener('drop', dragDrop);
            task.addEventListener('dragenter', dragEnter);
            task.addEventListener('dragleave', dragLeave);
        });
    }
    
    function dragStart(e) {
        const taskItem = e.target.closest('.task-item');
        dragStartIndex = Array.from(taskItem.parentNode.children).indexOf(taskItem);
        taskItem.classList.add('dragging');
    }
    
    function dragEnter(e) {
        e.preventDefault();
        e.target.closest('.task-item')?.classList.add('drag-over');
    }
    
    function dragLeave(e) {
        e.target.closest('.task-item')?.classList.remove('drag-over');
    }
    
    function dragOver(e) {
        e.preventDefault();
    }
    
    async function dragDrop(e) {
        e.preventDefault();
        
        const taskItem = e.target.closest('.task-item');
        taskItem.classList.remove('drag-over');
        
        dragEndIndex = Array.from(taskItem.parentNode.children).indexOf(taskItem);
        
        // Ne rien faire si on dépose au même endroit
        if (dragEndIndex === dragStartIndex) return;
        
        // Mettre à jour l'ordre dans le DOM
        const taskList = document.getElementById('taskList');
        const items = Array.from(taskList.children);
        const draggedItem = items[dragStartIndex];
        
        // Supprimer l'élément de sa position initiale
        items.splice(dragStartIndex, 1);
        // L'insérer à sa nouvelle position
        items.splice(dragEndIndex, 0, draggedItem);
        
        // Mettre à jour le DOM
        taskList.innerHTML = '';
        items.forEach(item => taskList.appendChild(item));
        
        // Redessiner les flèches après réorganisation
        drawTaskArrows();
        
        // Mettre à jour l'ordre dans la base de données
        const taskIds = items.map(item => parseInt(item.dataset.taskId));
        
        try {
            const response = await fetch('api/tasks-order.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskIds }),
            });
            
            const data = await response.json();
            if (!data.success) {
                console.error('Erreur lors de la mise à jour de l\'ordre des tâches:', data.error);
                // Optionnel : recharger la page ou les tâches en cas d'erreur
                await fetchTasks();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'ordre des tâches:', error);
            // Optionnel : recharger la page ou les tâches en cas d'erreur
            await fetchTasks();
        }
    }
    
    async function updateTasksOrder(taskIds) {
        try {
            const response = await fetch('api/tasks-order.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskIds }),
            });
            const data = await response.json();
            if (!data.success) {
                console.error('Erreur lors de la mise à jour de l\'ordre des tâches:', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'ordre des tâches:', error);
        }
    }

    



    // Fonctions utilitaires
    function formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatDateForInput(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function calculateTaskWidth(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
        return days * currentDayWidth;
    }

    function calculateTaskOffset(startDate) {
        const start = new Date(startDate);
        const days = (start.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24);
        return days * currentDayWidth;
    }

    // Initialisation du redimensionnement
    function initializeResizer() {
        const resizer = document.querySelector('.gantt-resizer');
        const sidebar = document.querySelector('.gantt-sidebar');

        resizer.addEventListener('mousedown', initResize);

        function initResize(e) {
            isResizing = true;
            originalWidth = sidebar.offsetWidth;
            originalX = e.clientX;
            
            document.body.classList.add('resizing');
            resizer.classList.add('resizing');
            
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        }

        function resize(e) {
            if (isResizing) {
                const width = originalWidth + (e.clientX - originalX);
                if (width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
                    sidebar.style.width = `${width}px`;
                    document.querySelectorAll('.task-name').forEach(el => {
                        el.style.width = `${width - 64}px`;
                    });
                    drawTaskArrows();
                }
            }
        }

        function stopResize() {
            isResizing = false;
            document.body.classList.remove('resizing');
            resizer.classList.remove('resizing');
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    // Initialisation du zoom
    function initializeZoom() {
        const zoomControls = document.querySelector('.zoom-controls');
        
        zoomControls.addEventListener('click', (e) => {
            if (e.target.classList.contains('zoom-btn')) {
                const zoomType = e.target.dataset.zoom;
                let newWidth = currentDayWidth;
                
                if (zoomType === 'in') {
                    newWidth = Math.min(currentDayWidth + 15, MAX_DAY_WIDTH);
                } else if (zoomType === 'out') {
                    newWidth = Math.max(currentDayWidth - 15, MIN_DAY_WIDTH);
                }
                
                if (newWidth !== currentDayWidth) {
                    currentDayWidth = newWidth;
                    renderTasks();
                    generateTimelineHeader();
                    scrollToToday();
                }
            }
        });
    }

    // Génération de l'en-tête du timeline
    function generateTimelineHeader() {
        timelineHeader.innerHTML = '';
        const currentDate = new Date(viewStartDate);

        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const cell = document.createElement('div');
            cell.className = 'timeline-header-cell';
            cell.style.width = `${currentDayWidth}px`;
            cell.textContent = formatDate(currentDate);
            
            if (currentDate.toDateString() === new Date().toDateString()) {
                cell.style.backgroundColor = '#fee2e2';
            }
            
            timelineHeader.appendChild(cell);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    // Fonction pour dessiner les flèches entre les tâches
    function drawArrow(fromTask, toTask) {
        const fromIndex = tasks.findIndex(t => t.id === fromTask.id);
        const toIndex = tasks.findIndex(t => t.id === toTask.id);
        
        const timelineContent = document.querySelector('.timeline-content');
        
        // Créer un conteneur pour le SVG
        const container = document.createElement('div');
        container.className = 'task-arrow-container';
        container.style.width = timelineContent.scrollWidth + 'px';
        container.style.height = timelineContent.scrollHeight + 'px';
        
        // Calculer les positions
        const fromOffset = calculateTaskOffset(fromTask.startDate);
        const fromWidth = calculateTaskWidth(fromTask.startDate, fromTask.endDate);
        const toOffset = calculateTaskOffset(toTask.startDate);
        
        const startX = fromOffset + fromWidth;
        const startY = (fromIndex * 32) + 16;
        const endX = toOffset;
        const endY = (toIndex * 32) + 16;
    
        // Créer l'élément SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add('task-arrow');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('viewBox', `0 0 ${timelineContent.scrollWidth} ${timelineContent.scrollHeight}`);
        
        // Créer le chemin avec des angles droits
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const middleX = startX + (endX - startX) / 2;
        
        // Construire le chemin avec des angles droits
        const pathD = `
            M ${startX} ${startY}
            H ${middleX}
            V ${endY}
            H ${endX}
        `;
        
        path.setAttribute('d', pathD);
        
        // Créer la pointe de flèche
        const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        arrow.setAttribute('points', `
            ${endX},${endY}
            ${endX-10},${endY-5}
            ${endX-10},${endY+5}
        `);
    
        // Ajouter un cercle au début de la flèche
        const startCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startCircle.setAttribute('cx', startX);
        startCircle.setAttribute('cy', startY);
        startCircle.setAttribute('r', '4');
    
        // Ajouter tous les éléments au SVG
        svg.appendChild(path);
        svg.appendChild(arrow);
        svg.appendChild(startCircle);
        container.appendChild(svg);
        timelineContent.appendChild(container);
    }

    function drawTaskArrows() {
        // Supprimer les flèches existantes
        document.querySelectorAll('.task-arrow').forEach(arrow => arrow.remove());
        
        tasks.forEach(task => {
            if (task.nextTasks && task.nextTasks.length > 0) {
                task.nextTasks.forEach(nextTaskId => {
                    const nextTask = tasks.find(t => t.id === nextTaskId);
                    if (nextTask) {
                        drawArrow(task, nextTask);
                    }
                });
            }
        });
    }

    // Affichage des tâches
    function renderTasks() {
        // Nettoyage
        taskList.innerHTML = '';
        timelineContent.innerHTML = '';
        
        // Ajout de la grille
        const gridContainer = document.createElement('div');
        gridContainer.className = 'timeline-grid';
        gridContainer.style.gridTemplateColumns = `repeat(${DAYS_TO_SHOW}, ${currentDayWidth}px)`;
        
        for (let i = 0; i < DAYS_TO_SHOW; i++) {
            const cell = document.createElement('div');
            cell.className = 'timeline-grid-cell';
            gridContainer.appendChild(cell);
        }
        
        timelineContent.appendChild(gridContainer);
    
        // Hauteur du conteneur basée sur le nombre de tâches
        const containerHeight = tasks.length * 32;
        timelineContent.style.height = `${containerHeight}px`;
    
        // Ligne du jour actuel
        const today = new Date();
        const todayOffset = calculateTaskOffset(today);
        const currentDayLine = document.createElement('div');
        currentDayLine.style.position = 'absolute';
        currentDayLine.style.top = '0';
        currentDayLine.style.left = `${todayOffset}px`;
        currentDayLine.style.width = '2px';
        currentDayLine.style.height = '100%';
        currentDayLine.style.backgroundColor = '#ef4444';
        currentDayLine.style.zIndex = '10';
        timelineContent.appendChild(currentDayLine);
    
        // Rendu des tâches
        tasks.forEach((task, index) => {
            // Élément de la liste des tâches
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.dataset.taskId = task.id;
    
            // Créer d'abord la description si elle existe
            if (task.description) {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'task-description';
                if (expandedDescriptions.has(task.id)) {
                    descriptionDiv.classList.add('expanded');
                }
                descriptionDiv.textContent = task.description;
                taskItem.appendChild(descriptionDiv);
            }
            
            // Créer le header de la tâche
            const taskHeader = document.createElement('div');
            taskHeader.className = 'task-header';
            
            const taskName = document.createElement('div');
            taskName.className = 'task-name';
            taskName.innerHTML = `
                ${task.isParent ? `<button class="toggle-btn">${task.expanded ? '-' : '+'}</button>` : ''}
                <button class="toggle-description">⬇️</button>
                ${task.title}
                <button class="delete-btn">❌</button>
            `;
    
            const taskProgress = document.createElement('div');
            taskProgress.className = 'task-progress';
            taskProgress.textContent = `${task.progress}%`;
    
            taskHeader.appendChild(taskName);
            taskHeader.appendChild(taskProgress);
            taskItem.appendChild(taskHeader);
    
            // Gestionnaires d'événements
            taskName.addEventListener('click', () => {
                editTask(task);
            });
    
            const toggleDescBtn = taskName.querySelector('.toggle-description');
            if (toggleDescBtn) {
                toggleDescBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const descriptionDiv = taskItem.querySelector('.task-description');
                    if (descriptionDiv) {
                        descriptionDiv.classList.toggle('expanded');
                        if (descriptionDiv.classList.contains('expanded')) {
                            expandedDescriptions.add(task.id);
                        } else {
                            expandedDescriptions.delete(task.id);
                        }
                    }
                });
            }
    
            if (task.isParent) {
                const toggleBtn = taskName.querySelector('.toggle-btn');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                    });
                }
            }
    
            const deleteBtn = taskName.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                });
            }
    
            taskList.appendChild(taskItem);
    
            // Barre de tâche dans le timeline
            if (task.startDate && task.endDate) {
                const taskBar = document.createElement('div');
                taskBar.className = 'timeline-task';
                taskBar.style.left = `${calculateTaskOffset(task.startDate)}px`;
                taskBar.style.width = `${calculateTaskWidth(task.startDate, task.endDate)}px`;
                taskBar.style.top = `${index * 32}px`;
                taskBar.style.backgroundColor = `${task.color}40` || '#4a9eff40';
    
                const progressBar = document.createElement('div');
                progressBar.className = 'timeline-task-progress';
                progressBar.style.width = `${task.progress}%`;
                progressBar.style.backgroundColor = task.color || '#4a9eff';
    
                const label = document.createElement('div');
                label.className = 'timeline-task-label';
                label.textContent = `${task.assignedTo || ''} (${task.progress}%)`;
                label.style.color = task.progress > 50 ? 'white' : 'black';
                progressBar.appendChild(label);
    
                taskBar.appendChild(progressBar);
                timelineContent.appendChild(taskBar);
            }
        });
    
        // Dessiner les flèches après avoir rendu toutes les tâches
        drawTaskArrows();
        addDragAndDropHandlers();
        drawTaskArrows();
    }

// Gestion des tâches
async function fetchTasks() {
    try {
        const response = await fetch('api/tasks.php');
        const data = await response.json();
        if (data.success) {
            tasks = data.data;
            renderTasks();
        } else {
            console.error('Erreur lors du chargement des tâches:', data.error);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
    }
}

async function createTask(taskData) {
    try {
        const response = await fetch('api/tasks.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (data.success) {
            await fetchTasks();
        } else {
            console.error('Erreur lors de la création de la tâche:', data.error);
        }
    } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error);
    }
}

async function updateTask(id, taskData) {
    try {
        const response = await fetch(`api/tasks.php?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (data.success) {
            await fetchTasks();
        } else {
            console.error('Erreur lors de la mise à jour de la tâche:', data.error);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
}

async function deleteTask(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        try {
            const response = await fetch(`api/tasks.php?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                await fetchTasks();
            } else {
                console.error('Erreur lors de la suppression de la tâche:', data.error);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la tâche:', error);
        }
    }
}

async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        await updateTask(id, { expanded: !task.expanded });
    }
}
// Gestion du modal
function showModal() {
    modal.style.display = 'block';
    modal.classList.add('active');

    // Si c'est une nouvelle tâche, réinitialiser le formulaire
    if (!selectedTask) {
        taskForm.reset();
        
        // Définir les dates par défaut
        const today = new Date();
        document.getElementById('startDate').value = formatDateForInput(today);
        document.getElementById('endDate').value = formatDateForInput(today);
        
        // Réinitialiser la couleur par défaut
        document.getElementById('taskColor').value = '#4a9eff';
        
        // Progression à 0 par défaut
        document.getElementById('taskProgress').value = '0';
    }

    // Mettre à jour la liste des tâches suivantes possibles
    const nextTasksSelect = document.getElementById('nextTasks');
    nextTasksSelect.innerHTML = ''; // Nettoyer les options existantes
    
    tasks.forEach(t => {
        if (!selectedTask || t.id !== selectedTask.id) {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.title;
            if (selectedTask && selectedTask.nextTasks && 
                selectedTask.nextTasks.includes(parseInt(t.id))) {
                option.selected = true;
            }
            nextTasksSelect.appendChild(option);
        }
    });
}


function hideModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        selectedTask = null;
        taskForm.reset();
    }, 300); // Correspond à la durée de la transition CSS
}

// Mise à jour de la fonction editTask
function editTask(task) {
    selectedTask = task;
    modalTitle.textContent = 'Modifier la tâche';
    
    // Pré-remplissage des champs
    document.getElementById('taskName').value = task.title;
    document.getElementById('taskProgress').value = task.progress;
    document.getElementById('description').value = task.description || '';
    
    if (task.startDate) {
        document.getElementById('startDate').value = formatDateForInput(task.startDate);
    }
    if (task.endDate) {
        document.getElementById('endDate').value = formatDateForInput(task.endDate);
    }
    
    document.getElementById('assignedTo').value = task.assignedTo || '';
    document.getElementById('taskColor').value = task.color || '#4a9eff';
    
    showModal();
}
// Scroll au jour actuel au chargement
function scrollToToday() {
    const today = new Date();
    const offset = calculateTaskOffset(today);
    const timelineContainer = document.querySelector('.gantt-timeline');
    timelineContainer.scrollLeft = offset - timelineContainer.clientWidth / 2;
}

// Event Listeners pour le modal
newTaskBtn.addEventListener('click', () => {
    selectedTask = null;
    modalTitle.textContent = 'Nouvelle tâche';
    showModal();
});

closeBtn.addEventListener('click', hideModal);
cancelBtn.addEventListener('click', hideModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Mise à jour de la fonction de soumission du formulaire
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nextTasksSelect = document.getElementById('nextTasks');
    const selectedTasks = Array.from(nextTasksSelect.selectedOptions)
                              .map(option => parseInt(option.value))
                              .filter(id => !isNaN(id)); // Filtrer les valeurs non numériques
    
    const formData = {
        title: document.getElementById('taskName').value,
        progress: parseInt(document.getElementById('taskProgress').value),
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        assignedTo: document.getElementById('assignedTo').value,
        color: document.getElementById('taskColor').value,
        description: document.getElementById('description').value,
        nextTasks: selectedTasks,
        isParent: false,
        expanded: true
    };

    if (selectedTask) {
        await updateTask(selectedTask.id, formData);
    } else {
        await createTask(formData);
    }

    hideModal();
});

// Initialisation
initializeResizer();
initializeZoom();
generateTimelineHeader();
fetchTasks().then(() => {
    scrollToToday();
});
});
