

<?php require_once 'config/database.php'; ?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gantt Chart</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <main class="container">
        <div class="gantt-container">
            <div class="gantt-header">
                <button id="newTaskBtn" class="btn btn-primary">
                    <span class="icon">+</span>
                    Nouvelle tâche
                </button>
            </div>
            <div class="gantt-content">
                <div class="gantt-sidebar">
                    <div class="gantt-resizer"></div>
                    <div class="gantt-sidebar-header">
                        <div class="task-header">Tâches</div>
                        <div class="progress-header">%</div>
                    </div>
                    <div id="taskList" class="task-list"></div>
                </div>
                <div class="zoom-controls">
                   
                </div>
                <div class="gantt-timeline" id="ganttTimeline">
                    
                    <div class="timeline-header" id="timelineHeader"></div>
                    <div class="timeline-content" id="timelineContent"></div>
                </div>
            </div>
        </div>
    </main>

    <!-- Modal pour l'édition/création de tâche -->
    <div id="taskModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modalTitle">Nouvelle tâche</h2>
            <form id="taskForm">
                <div class="form-group">
                    <label for="taskName">Nom de la tâche</label>
                    <input type="text" id="taskName" name="name" required>
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" rows="4"></textarea>
                </div>

                <div class="form-group">
                    <label for="nextTasks">Tâches suivantes</label>
                    <select id="nextTasks" name="nextTasks[]" multiple class="select-multiple">
                        <!-- Les options seront ajoutées dynamiquement -->
                    </select>
                    <small class="help-text">Utilisez CTRL + clic pour sélectionner plusieurs tâches</small>
                </div>
                                
                <div class="form-group">
                    <label for="taskProgress">Progression (%)</label>
                    <input type="number" id="taskProgress" name="progress" min="0" max="100" required>
                </div>
                <div class="form-group">
                    <label for="startDate">Date de début</label>
                    <input type="date" id="startDate" name="startDate" required>
                </div>
                <div class="form-group">
                    <label for="endDate">Date de fin</label>
                    <input type="date" id="endDate" name="endDate" required>
                </div>
                <div class="form-group">
                    <label for="assignedTo">Assigné à</label>
                    <input type="text" id="assignedTo" name="assignedTo">
                </div>
                <div class="form-group">
                    <label for="taskColor">Couleur</label>
                    <input type="color" id="taskColor" name="color" value="#4a9eff">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelBtn">Annuler</button>
                    <button type="submit" class="btn btn-primary">Sauvegarder</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/gantt.js"></script>
</body>
</html>