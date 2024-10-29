# GanttFlow - Collaborative Project Timeline Manager


![Static Badge](https://img.shields.io/badge/Contributeur-1-brightgreen?style=flat&logo=clubhouse&logoColor=white&logoSize=auto)
![License](https://img.shields.io/github/license/Nyx-Off/AceVenturaTheGame) 
![Static Badge](https://img.shields.io/badge/PHP-black?style=plastic&logo=php&logoColor=white&logoSize=auto&color=green)
![Static Badge](https://img.shields.io/badge/CSS-black?style=plastic&logo=css3&logoColor=white&logoSize=auto&color=blue)
![Static Badge](https://img.shields.io/badge/JavaScript-black?style=plastic&logo=javascript&logoColor=white&logoSize=auto&color=purple)
![Static Badge](https://img.shields.io/badge/MySQL-brown%20?style=plastic&logo=mysql&logoColor=white&logoSize=auto)



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

GanttFlow utilise une architecture simple et efficace basée sur une API PHP et une interface JavaScript. Le projet est structuré pour être léger et facile à maintenir.

#### Frontend
L'interface utilisateur est développée en JavaScript vanilla, sans dépendances externes, ce qui garantit des performances optimales. Voici un exemple réel de la gestion des tâches :

```javascript
// Extrait de gantt.js - Gestion des tâches
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
```

Le CSS utilise des variables personnalisées pour une meilleure maintenabilité :

```css
/* Extrait de style.css */
:root {
    --primary-color: #4a9eff;
    --background-color: #ffffff;
    --border-color: #e5e7eb;
    --text-color: #374151;
    --hover-bg: #f9fafb;
    --modal-overlay: rgba(0, 0, 0, 0.5);
    --error-color: #ef4444;
    --success-color: #10b981;
}
```

#### Backend

Le backend utilise PHP avec PDO pour une gestion sécurisée des données. Voici la structure réelle de l'API :

```php
// Extrait de tasks.php
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            // Récupérer les tâches triées par ordre
            $tasks = $pdo->query('SELECT * FROM tasks ORDER BY `order` ASC, id ASC')->fetchAll();
            
            // Récupérer les dépendances pour chaque tâche
            $dependencies = $pdo->query('SELECT * FROM task_dependencies')->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $tasks]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
}
```

### Structure de la Base de Données

Le projet utilise deux tables principales :

```sql
-- Table des tâches
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
    `order` INT DEFAULT 0
);

-- Table des dépendances
CREATE TABLE task_dependencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_from INT NOT NULL,
    task_to INT NOT NULL,
    FOREIGN KEY (task_from) REFERENCES tasks(id),
    FOREIGN KEY (task_to) REFERENCES tasks(id)
);
```

### Fonctionnalités Techniques Implémentées

1. **Drag & Drop** : Implémentation native pour la réorganisation des tâches
2. **Gestion des dépendances** : Système de flèches pour visualiser les liens entre tâches
3. **Zoom Timeline** : Contrôle de la largeur des colonnes du diagramme
4. **Redimensionnement** : Barre latérale ajustable
5. **Gestion Modal** : Interface de création/édition des tâches
6. **Sécurité basique** : Utilisation de PDO pour les requêtes préparées

### Sécurité

La sécurité de base est assurée par :
- L'utilisation de PDO avec des requêtes préparées
- La validation des entrées côté serveur
- Le contrôle des méthodes HTTP autorisées

Cette version reflète fidèlement ce qui est actuellement implémenté dans le code source du projet.

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
