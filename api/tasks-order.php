<?php
require_once '../config/database.php';
header('Content-Type: application/json');

$pdo = getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['taskIds']) || !is_array($data['taskIds'])) {
            throw new Exception('Liste des tâches invalide');
        }
        
        $pdo->beginTransaction();
        
        // Préparer la requête de mise à jour
        $stmt = $pdo->prepare("UPDATE tasks SET `order` = :order WHERE id = :id");
        
        // Mettre à jour l'ordre pour chaque tâche
        foreach ($data['taskIds'] as $order => $taskId) {
            $stmt->execute([
                ':order' => $order + 1, // On commence à 1 pour éviter le 0
                ':id' => $taskId
            ]);
        }
        
        $pdo->commit();
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}