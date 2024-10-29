<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$pdo = getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            // Récupérer les tâches triées par ordre
            $tasks = $pdo->query('SELECT * FROM tasks ORDER BY `order` ASC, id ASC')->fetchAll();
            
            // Récupérer les dépendances pour chaque tâche
            $dependencies = $pdo->query('SELECT * FROM task_dependencies')->fetchAll();
            
            // Ajouter les dépendances à chaque tâche
            foreach ($tasks as &$task) {
                $task['nextTasks'] = array_map(
                    function($dep) { return $dep['task_to']; },
                    array_filter($dependencies, function($dep) use ($task) {
                        return $dep['task_from'] == $task['id'];
                    })
                );
            }
            
            echo json_encode(['success' => true, 'data' => $tasks]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $pdo->beginTransaction();
            
            // Création d'une nouvelle tâche
            $sql = "INSERT INTO tasks (
                title, 
                startDate, 
                endDate, 
                progress, 
                assignedTo, 
                color, 
                description,
                isParent,
                expanded,
                parentId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['title'],
                $data['startDate'],
                $data['endDate'],
                $data['progress'],
                $data['assignedTo'] ?? null,
                $data['color'] ?? '#4a9eff',
                $data['description'] ?? null,
                $data['isParent'] ?? false,
                $data['expanded'] ?? true,
                $data['parentId'] ?? null
            ]);
            
            $taskId = $pdo->lastInsertId();
            
            // Ajouter les dépendances
            if (!empty($data['nextTasks'])) {
                $sql = "INSERT INTO task_dependencies (task_from, task_to) VALUES (?, ?)";
                $stmt = $pdo->prepare($sql);
                foreach ($data['nextTasks'] as $nextTaskId) {
                    $stmt->execute([$taskId, $nextTaskId]);
                }
            }
            
            $pdo->commit();
            
            // Récupérer la tâche créée avec ses dépendances
            $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
            $stmt->execute([$taskId]);
            $task = $stmt->fetch();
            
            $stmt = $pdo->prepare('SELECT task_to FROM task_dependencies WHERE task_from = ?');
            $stmt->execute([$taskId]);
            $task['nextTasks'] = array_column($stmt->fetchAll(), 'task_to');
            
            echo json_encode(['success' => true, 'data' => $task]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID manquant']);
            break;
        }

        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $pdo->beginTransaction();

            // Construire la requête de mise à jour dynamiquement
            $updates = [];
            $params = [];

            if (isset($data['title'])) {
                $updates[] = "title = ?";
                $params[] = $data['title'];
            }
            if (isset($data['startDate'])) {
                $updates[] = "startDate = ?";
                $params[] = $data['startDate'];
            }
            if (isset($data['endDate'])) {
                $updates[] = "endDate = ?";
                $params[] = $data['endDate'];
            }
            if (isset($data['progress'])) {
                $updates[] = "progress = ?";
                $params[] = $data['progress'];
            }
            if (isset($data['assignedTo'])) {
                $updates[] = "assignedTo = ?";
                $params[] = $data['assignedTo'];
            }
            if (isset($data['color'])) {
                $updates[] = "color = ?";
                $params[] = $data['color'];
            }
            if (isset($data['description'])) {
                $updates[] = "description = ?";
                $params[] = $data['description'];
            }
            if (isset($data['isParent'])) {
                $updates[] = "isParent = ?";
                $params[] = $data['isParent'];
            }
            if (isset($data['expanded'])) {
                $updates[] = "expanded = ?";
                $params[] = $data['expanded'];
            }
            if (isset($data['parentId'])) {
                $updates[] = "parentId = ?";
                $params[] = $data['parentId'];
            }

            if (!empty($updates)) {
                // Ajouter l'ID à la fin des paramètres
                $params[] = $id;
                
                $sql = "UPDATE tasks SET " . implode(', ', $updates) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }

            // Mettre à jour les dépendances si elles sont fournies
            if (isset($data['nextTasks'])) {
                // Supprimer les anciennes dépendances
                $stmt = $pdo->prepare('DELETE FROM task_dependencies WHERE task_from = ?');
                $stmt->execute([$id]);

                // Ajouter les nouvelles dépendances
                if (!empty($data['nextTasks'])) {
                    $sql = "INSERT INTO task_dependencies (task_from, task_to) VALUES (?, ?)";
                    $stmt = $pdo->prepare($sql);
                    foreach ($data['nextTasks'] as $nextTaskId) {
                        $stmt->execute([$id, $nextTaskId]);
                    }
                }
            }

            $pdo->commit();

            // Récupérer la tâche mise à jour avec ses dépendances
            $stmt = $pdo->prepare('SELECT * FROM tasks WHERE id = ?');
            $stmt->execute([$id]);
            $task = $stmt->fetch();

            $stmt = $pdo->prepare('SELECT task_to FROM task_dependencies WHERE task_from = ?');
            $stmt->execute([$id]);
            $task['nextTasks'] = array_column($stmt->fetchAll(), 'task_to');

            echo json_encode(['success' => true, 'data' => $task]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID manquant']);
            break;
        }

        try {
            $pdo->beginTransaction();
            
            // Supprimer les dépendances
            $stmt = $pdo->prepare('DELETE FROM task_dependencies WHERE task_from = ? OR task_to = ?');
            $stmt->execute([$id, $id]);
            
            // Supprimer d'abord les tâches enfants
            $stmt = $pdo->prepare('DELETE FROM tasks WHERE parentId = ?');
            $stmt->execute([$id]);
            
            // Puis supprimer la tâche principale
            $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ?');
            $stmt->execute([$id]);
            
            $pdo->commit();
            
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
        break;
}