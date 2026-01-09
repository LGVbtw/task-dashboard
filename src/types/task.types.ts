/**
 * Types et interfaces pour le système de gestion des tâches
 * Correspond au contrat de l'API Python
 */

/**
 * Status possibles d'une tâche dans le Kanban
 */
export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

/**
 * Priorités possibles d'une tâche
 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Interface principale d'une tâche
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // Date de création (obligatoire)
}

/**
 * Type pour la création d'une tâche (sans ID, sans createdAt)
 */
export type CreateTaskDTO = Omit<Task, 'id' | 'createdAt'>;

/**
 * Type pour la mise à jour d'une tâche (tous les champs sont optionnels sauf l'ID)
 */
export type UpdateTaskDTO = Partial<Omit<Task, 'id' | 'createdAt'>> & {
  id: string;
};

/**
 * Filtre de recherche pour les tâches
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  searchTerm?: string;
}

/**
 * Configuration des colonnes du Kanban
 */
export interface KanbanColumn {
  status: TaskStatus;
  title: string;
  color: string;
}

/**
 * Constantes pour les statuts (utile pour les mappings)
 */
export const TASK_STATUS: Record<TaskStatus, string> = {
  TODO: 'À faire',
  DOING: 'En cours',
  DONE: 'Terminé'
};

/**
 * Constantes pour les priorités
 */
export const TASK_PRIORITY: Record<TaskPriority, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute'
};

/**
 * Configuration du Kanban
 */
export const KANBAN_COLUMNS: KanbanColumn[] = [
  { status: 'TODO', title: 'À faire', color: '#f5222d' },
  { status: 'DOING', title: 'En cours', color: '#faad14' },
  { status: 'DONE', title: 'Terminé', color: '#52c41a' }
];
