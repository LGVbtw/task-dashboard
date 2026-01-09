/**
 * Hook principal de gestion des tâches
 * Centralise toute la logique métier (CRUD) des tâches
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../types/task.types';
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/storage';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les tâches au démarrage
  useEffect(() => {
    const loadedTasks = loadTasksFromStorage();
    setTasks(loadedTasks);
    setLoading(false);
  }, []);

  // Sauvegarder automatiquement à chaque changement
  useEffect(() => {
    if (!loading) {
      saveTasksToStorage(tasks);
    }
  }, [tasks, loading]);

  /**
   * Créer une nouvelle tâche
   */
  const createTask = useCallback((taskData: CreateTaskDTO): Task => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(), // Génère un UUID unique
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  /**
   * Mettre à jour une tâche existante
   */
  const updateTask = useCallback((taskData: UpdateTaskDTO): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskData.id
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task
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
   * Changer le statut d'une tâche (pour le drag & drop)
   */
  const changeTaskStatus = useCallback((taskId: string, newStatus: TaskStatus): void => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  /**
   * Obtenir une tâche par son ID
   */
  const getTaskById = useCallback(
    (taskId: string): Task | undefined => {
      return tasks.find((task) => task.id === taskId);
    },
    [tasks]
  );

  /**
   * Obtenir les tâches par statut
   */
  const getTasksByStatus = useCallback(
    (status: TaskStatus): Task[] => {
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    getTaskById,
    getTasksByStatus,
  };
};
