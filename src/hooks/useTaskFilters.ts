/**
 * Hook de gestion des filtres de tâches
 * Gère la recherche et le filtrage des tâches
 */

import { useState, useMemo } from 'react';
import type { Task, TaskFilters, TaskStatus, TaskPriority } from '../types/task.types';

export const useTaskFilters = (tasks: Task[]) => {
  const [filters, setFilters] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    searchTerm: '',
  });

  /**
   * Appliquer les filtres sur les tâches
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtre par statut
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Filtre par priorité
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Filtre par recherche textuelle
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(searchLower);
        const matchDescription = task.description?.toLowerCase().includes(searchLower);
        if (!matchTitle && !matchDescription) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  /**
   * Mettre à jour un filtre spécifique
   */
  const updateFilter = (key: keyof TaskFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Réinitialiser tous les filtres
   */
  const resetFilters = () => {
    setFilters({
      status: undefined,
      priority: undefined,
      searchTerm: '',
    });
  };

  /**
   * Définir le terme de recherche
   */
  const setSearchTerm = (term: string) => {
    updateFilter('searchTerm', term);
  };

  /**
   * Définir le filtre de statut
   */
  const setStatusFilter = (status: TaskStatus | undefined) => {
    updateFilter('status', status);
  };

  /**
   * Définir le filtre de priorité
   */
  const setPriorityFilter = (priority: TaskPriority | undefined) => {
    updateFilter('priority', priority);
  };

  return {
    filters,
    filteredTasks,
    setSearchTerm,
    setStatusFilter,
    setPriorityFilter,
    resetFilters,
  };
};
