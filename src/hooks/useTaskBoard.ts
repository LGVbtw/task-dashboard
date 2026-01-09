/**
 * Hook useTaskBoard - Gestion complète du Kanban Board
 * Centralise la logique des tâches + des modales
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskDTO, TaskStatus } from '../types/task.types';

const STORAGE_KEY = 'task-dashboard-tasks';

/**
 * Données de test (mock) si localStorage vide
 */
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Configurer le projet React',
    description: 'Installation de Vite, TypeScript et Ant Design',
    status: 'DONE',
    priority: 'HIGH',
    createdAt: new Date('2026-01-08T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    title: 'Créer les types TypeScript',
    description: 'Définir les interfaces Task, TaskStatus, TaskPriority',
    status: 'DONE',
    priority: 'HIGH',
    createdAt: new Date('2026-01-08T11:00:00Z').toISOString(),
  },
  {
    id: '3',
    title: 'Développer le hook useTaskBoard',
    description: 'Gérer l\'état des tâches avec localStorage et modales',
    status: 'DOING',
    priority: 'MEDIUM',
    createdAt: new Date('2026-01-09T09:00:00Z').toISOString(),
  },
  {
    id: '4',
    title: 'Implémenter le composant Kanban',
    description: 'Afficher les 3 colonnes avec drag & drop',
    status: 'TODO',
    priority: 'MEDIUM',
    createdAt: new Date('2026-01-09T10:00:00Z').toISOString(),
  },
  {
    id: '5',
    title: 'Ajouter les tests unitaires',
    description: 'Tester le hook et les composants avec Vitest',
    status: 'TODO',
    priority: 'LOW',
    createdAt: new Date('2026-01-09T11:00:00Z').toISOString(),
  },
];

export const useTaskBoard = () => {
  // État des tâches
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // État de la modale
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  /**
   * Charger les tâches depuis localStorage au montage
   * Si vide, initialiser avec les données de test
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedTasks = JSON.parse(stored);
        setTasks(Array.isArray(parsedTasks) ? parsedTasks : MOCK_TASKS);
      } else {
        // Pas de données → Initialiser avec le mock
        setTasks(MOCK_TASKS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TASKS));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sauvegarder automatiquement dans localStorage à chaque modification
   */
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des tâches:', error);
      }
    }
  }, [tasks, loading]);

  /**
   * Ajouter une nouvelle tâche
   */
  const addTask = useCallback((taskData: CreateTaskDTO): void => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  /**
   * Mettre à jour une tâche existante
   */
  const updateTask = useCallback((taskId: string, updates: Partial<CreateTaskDTO>): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  /**
   * Supprimer une tâche
   */
  const deleteTask = useCallback((taskId: string): void => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  /**
   * Changer le statut d'une tâche (pour le drag & drop entre colonnes)
   */
  const changeTaskStatus = useCallback((taskId: string, newStatus: TaskStatus): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  }, []);

  /**
   * Ouvrir la modale pour créer une nouvelle tâche
   */
  const openCreateModal = useCallback(() => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  }, []);

  /**
   * Ouvrir la modale pour éditer une tâche existante
   */
  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  /**
   * Fermer la modale
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  }, []);

  /**
   * Soumettre le formulaire (création ou édition)
   */
  const submitTaskForm = useCallback((formData: CreateTaskDTO) => {
    if (editingTask) {
      // Mode édition
      updateTask(editingTask.id, formData);
    } else {
      // Mode création
      addTask(formData);
    }
    closeModal();
  }, [editingTask, addTask, updateTask, closeModal]);

  return {
    // État
    tasks,
    loading,
    isModalOpen,
    editingTask,
    
    // Actions CRUD
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    
    // Actions Modale
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  };
};
