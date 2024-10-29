# GanttFlow - Collaborative Project Timeline Manager

GanttFlow est un outil de gestion de projet Gantt en ligne, gratuit et collaboratif, conçu pour simplifier la planification et le suivi des projets d'équipe. Ce projet est né d'un besoin concret : offrir une alternative gratuite et accessible aux solutions Gantt existantes, particulièrement pour les projets étudiants et les petites équipes.

## 🌟 Vision et Objectifs

Dans un contexte où les outils de gestion de projet peuvent être coûteux ou complexes, GanttFlow se positionne comme une solution légère et intuitive. L'objectif principal est de permettre aux équipes de visualiser facilement leurs échéanciers, de suivre l'avancement des tâches et de collaborer efficacement, le tout sans avoir à investir dans des solutions onéreuses.

Notre approche se concentre sur l'essentiel : une interface claire, des fonctionnalités utiles et une expérience utilisateur fluide. Le projet a été développé avec une attention particulière portée à la performance et à la facilité d'utilisation, permettant même aux utilisateurs novices de prendre en main l'outil rapidement.

## 💫 Fonctionnalités Principales

GanttFlow offre un ensemble complet de fonctionnalités pensées pour la gestion de projet collaborative. L'interface permet de créer et gérer des tâches avec leurs dates, d'établir des dépendances entre elles, et de suivre leur progression en temps réel. La visualisation sous forme de diagramme de Gantt donne une vue d'ensemble claire du projet et de son avancement.

La gestion des tâches est enrichie par des fonctionnalités de personnalisation comme l'attribution de couleurs, l'ajout de descriptions détaillées, et l'assignation aux membres de l'équipe. Le système de drag & drop permet une réorganisation intuitive des tâches, tandis que les relations entre tâches sont visualisées par des flèches interactives.

L'aspect collaboratif est au cœur du projet, avec une mise à jour en temps réel des modifications et une interface responsive qui s'adapte à tous les écrans, permettant un accès facile depuis n'importe quel appareil.

## 🛠 Aspects Techniques

Développé avec des technologies web modernes, GanttFlow repose sur une architecture simple mais efficace. Le frontend utilise du JavaScript vanilla pour garantir des performances optimales, tandis que le backend en PHP assure une gestion robuste des données via MySQL.

L'application est construite autour de quelques concepts clés :
- Une interface utilisateur réactive et intuitive en HTML5/CSS3/JavaScript
- Un backend PHP moderne avec PDO pour la sécurité des données
- Une base de données MySQL optimisée avec des relations bien pensées
- Une API REST pour la communication client-serveur
- Un système de mise à jour en temps réel des modifications

### Architecture et Technologies

GanttFlow est construit sur une architecture moderne orientée API, permettant une séparation claire entre le frontend et le backend. Cette approche facilite la maintenance et permet d'éventuelles évolutions futures vers des applications mobiles natives.

#### Frontend
L'interface utilisateur est développée en JavaScript vanilla, un choix délibéré pour optimiser les performances et minimiser la taille du bundle. L'application utilise les dernières fonctionnalités d'ES6+ :

```javascript
// Exemple de gestion des tâches avec les fonctionnalités modernes de JS
class TaskManager {
    #tasks = new Map();
    
    async addTask(taskData) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
            
            const result = await response.json();
            this.#tasks.set(result.id, result);
            this.emit('taskAdded', result);
        } catch (error) {
            console.error('Erreur lors de l'ajout de la tâche:', error);
        }
    }
}
```

Le CSS utilise des variables personnalisées et une architecture modulaire :

```css
:root {
    --primary-color: #4a9eff;
    --secondary-color: #34d399;
    --danger-color: #ef4444;
    --background-color: #ffffff;
    --text-color: #374151;
}

/* Exemple de composant modulaire */
.gantt-task {
    background-color: var(--background-color);
    border: 1px solid var(--primary-color);
    transition: transform 0.2s ease;
}
```

#### Backend

Le backend est structuré autour d'une API REST en PHP, utilisant PDO pour une gestion sécurisée des données. Voici un exemple de la structure des contrôleurs :

```php
class TaskController {
    private $db;
    
    public function __construct(PDO $db) {
        $this->db = $db;
    }
    
    public function createTask(array $data): array {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO tasks (
                    title, description, startDate, endDate, 
                    progress, assignedTo, color
                ) VALUES (
                    :title, :description, :startDate, :endDate,
                    :progress, :assignedTo, :color
                )
            ");
            
            $stmt->execute($data);
            return ['success' => true, 'id' => $this->db->lastInsertId()];
        } catch (PDOException $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
```

### Structure de la Base de Données

Le schéma de la base de données est optimisé pour les performances et la cohérence des données :

```sql
-- Table principale des tâches
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    progress INT DEFAULT 0,
    assignedTo VARCHAR(255),
    color VARCHAR(7) DEFAULT '#4a9eff',
    isParent BOOLEAN DEFAULT false,
    expanded BOOLEAN DEFAULT true,
    parentId INT,
    `order` INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_dates (startDate, endDate),
    INDEX idx_order (`order`)
);

-- Table des dépendances entre tâches
CREATE TABLE task_dependencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_from INT NOT NULL,
    task_to INT NOT NULL,
    FOREIGN KEY (task_from) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (task_to) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dependency (task_from, task_to)
);
```

### Optimisations et Performance

GanttFlow intègre plusieurs optimisations pour garantir une expérience fluide même avec un grand nombre de tâches :

1. **Gestion de la mémoire** :
   ```javascript
   // Exemple de recyclage des éléments DOM pour les grandes listes
   class VirtualizedTaskList {
       #visibleItems = new Set();
       
       updateVisibleItems(scrollPos) {
           const visibleRange = this.calculateVisibleRange(scrollPos);
           this.#recycleHiddenItems(visibleRange);
           this.#renderVisibleItems(visibleRange);
       }
   }
   ```

2. **Cache et Pagination** :
   ```php
   // Exemple de mise en cache des requêtes fréquentes
   class TaskRepository {
       private $cache;
       
       public function getTasks(int $page = 1, int $limit = 50): array {
           $cacheKey = "tasks_page_{$page}_{$limit}";
           
           if ($this->cache->has($cacheKey)) {
               return $this->cache->get($cacheKey);
           }
           
           $result = $this->fetchTasksFromDb($page, $limit);
           $this->cache->set($cacheKey, $result, 300); // Cache for 5 minutes
           
           return $result;
       }
   }
   ```

3. **Optimisation des requêtes SQL** :
   ```sql
   -- Exemple d'index composite pour les recherches fréquentes
   CREATE INDEX idx_task_search 
   ON tasks(assignedTo, startDate, progress);
   
   -- Exemple de vue matérialisée pour les statistiques
   CREATE VIEW task_statistics AS
   SELECT 
       assignedTo,
       COUNT(*) as total_tasks,
       AVG(progress) as avg_progress
   FROM tasks
   GROUP BY assignedTo;
   ```

### Sécurité

La sécurité est une priorité, avec plusieurs mesures implémentées :

```php
// Exemple de middleware de sécurité
class SecurityMiddleware {
    public function process(Request $request, callable $next) {
        // Vérification CSRF
        if (!$this->validateCsrfToken($request)) {
            throw new SecurityException('Invalid CSRF token');
        }
        
        // En-têtes de sécurité
        header('Content-Security-Policy: default-src \'self\'');
        header('X-Frame-Options: DENY');
        header('X-Content-Type-Options: nosniff');
        
        return $next($request);
    }
}
```

### Tests et Qualité du Code

Le projet maintient un haut niveau de qualité grâce à des tests automatisés :

```php
// Exemple de test unitaire
class TaskTest extends TestCase {
    public function testTaskCreation() {
        $taskData = [
            'title' => 'Test Task',
            'startDate' => '2024-01-01',
            'endDate' => '2024-01-10'
        ];
        
        $task = new Task($taskData);
        
        $this->assertEquals('Test Task', $task->getTitle());
        $this->assertTrue($task->getStartDate() <= $task->getEndDate());
    }
}
```

## 📦 Installation et Déploiement

L'installation de GanttFlow a été pensée pour être simple et rapide. Le projet nécessite un serveur web avec PHP 7.4+ et MySQL 5.7+. La configuration se fait en quelques étapes :

1. Clonez le repository et configurez votre serveur web
2. Créez une base de données MySQL et importez la structure fournie
3. Configurez les accès dans le fichier database.php
4. L'application est prête à être utilisée !

Un guide détaillé d'installation et de configuration est disponible dans le dossier docs/ du projet.

## 🤝 Contribution et Communauté

GanttFlow est un projet open source qui accueille les contributions de la communauté. Que ce soit pour corriger des bugs, ajouter des fonctionnalités ou améliorer la documentation, toute aide est appréciée. Les contributeurs sont invités à forker le projet, créer une branche pour leurs modifications et soumettre une pull request.

Le projet suit des standards de code stricts pour maintenir une base de code propre et maintenable. Les tests sont encouragés pour toute nouvelle fonctionnalité.

## 📫 Support et Contact

Pour toute question ou suggestion concernant GanttFlow, n'hésitez pas à :
- Ouvrir une issue sur GitHub
- Rejoindre la discussion dans les pull requests
- Contacter directement l'équipe de développement

## 📝 Licence

GanttFlow est distribué sous la licence MIT, permettant une utilisation libre, y compris dans un contexte commercial. Voir le fichier LICENSE pour plus de détails.

---

GanttFlow est maintenu avec ❤️ par ses contributeurs. Nous sommes constamment à l'écoute des retours de la communauté pour améliorer l'outil et le rendre plus utile pour tous.
