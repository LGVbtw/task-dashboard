/**
 * Utilitaires pour la gestion du localStorage
 * Sauvegarde et chargement des tâches
 */

import type { Task } from '../types/task.types';

const STORAGE_KEY = 'task-dashboard-tasks';

/**
 * Charger les tâches depuis le localStorage
 */
export const loadTasksFromStorage = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const tasks = JSON.parse(stored);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error('Erreur lors du chargement des tâches:', error);
    return [];
  }
};

/**
 * Sauvegarder les tâches dans le localStorage
 */
export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des tâches:', error);
  }
};

/**
 * Effacer toutes les tâches du localStorage
 */
export const clearTasksFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de l\'effacement des tâches:', error);
  }
};

/**
 * Exporter les tâches en JSON (pour téléchargement)
 */
export const exportTasksToJSON = (tasks: Task[]): string => {
  return JSON.stringify(tasks, null, 2);
};

/**
 * Importer des tâches depuis un JSON
 */
export const importTasksFromJSON = (json: string): Task[] => {
  try {
    const tasks = JSON.parse(json);
    if (!Array.isArray(tasks)) {
      throw new Error('Le format JSON est invalide');
    }
    return tasks;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    throw error;
  }
};
