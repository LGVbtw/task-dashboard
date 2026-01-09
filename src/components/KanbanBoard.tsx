/**
 * KanbanBoard - Composant principal du tableau Kanban
 * Composant autonome qui utilise useTaskBoard et gère tout l'affichage
 * Strictement Ant Design v5 - Pas de CSS custom
 * Drag & Drop avec @dnd-kit/core
 */

import { Row, Col, Card, Tag, Button, Space, Popconfirm, Empty, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, HolderOutlined } from '@ant-design/icons';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { TaskModal } from './TaskModal';
import { KANBAN_COLUMNS } from '../types/task.types';
import type { Task, TaskStatus } from '../types/task.types';

interface KanbanBoardProps {
  searchTerm?: string; // Terme de recherche optionnel venant du Dashboard
}

// Couleurs pour les priorités
const PRIORITY_COLORS = {
  LOW: 'green',
  MEDIUM: 'orange',
  HIGH: 'red',
} as const;

// Couleurs pour les statuts (matching KANBAN_COLUMNS)
const STATUS_COLORS = {
  TODO: '#f5222d',
  DOING: '#faad14',
  DONE: '#52c41a',
} as const;

// Types de tri disponibles
type SortType = 
  | 'priority-high-low'
  | 'priority-low-high'
  | 'date-newest'
  | 'date-oldest'
  | 'title-asc'
  | 'title-desc';

// Clés pour localStorage
const SORT_STORAGE_KEY = 'kanban-sort-preference';
const PRIORITY_FILTER_STORAGE_KEY = 'kanban-priority-filter';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ searchTerm = '' }) => {
  const {
    tasks,
    isModalOpen,
    editingTask,
    deleteTask,
    changeTaskStatus,
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  } = useTaskBoard();

  // État pour le drag & drop
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // État pour le tri (chargé depuis localStorage)
  const [sortType, setSortType] = useState<SortType>(() => {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    return (saved as SortType) || 'priority-high-low';
  });

  // État pour le filtre de priorité (chargé depuis localStorage)
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>(() => {
    const saved = localStorage.getItem(PRIORITY_FILTER_STORAGE_KEY);
    return (saved as 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') || 'ALL';
  });

  // État pour gérer l'expansion des colonnes (afficher toutes les tâches ou seulement 5)
  const [expandedColumns, setExpandedColumns] = useState<Set<TaskStatus>>(new Set());

  // Limite de tâches affichées par défaut
  const INITIAL_TASK_LIMIT = 5;

  // Sauvegarder le tri dans localStorage quand il change
  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sortType);
  }, [sortType]);

  // Sauvegarder le filtre de priorité dans localStorage
  useEffect(() => {
    localStorage.setItem(PRIORITY_FILTER_STORAGE_KEY, priorityFilter);
  }, [priorityFilter]);

  /**
   * Fonction de tri des tâches
   */
  const sortTasks = (tasksToSort: Task[]): Task[] => {
    const sorted = [...tasksToSort];

    switch (sortType) {
      case 'priority-high-low':
        return sorted.sort((a, b) => {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

      case 'priority-low-high':
        return sorted.sort((a, b) => {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

      case 'date-newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case 'date-oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));

      default:
        return sorted;
    }
  };

  /**
   * Compter les tâches par priorité pour une colonne
   */
  const countByPriority = (columnTasks: Task[]) => {
    return {
      HIGH: columnTasks.filter((t) => t.priority === 'HIGH').length,
      MEDIUM: columnTasks.filter((t) => t.priority === 'MEDIUM').length,
      LOW: columnTasks.filter((t) => t.priority === 'LOW').length,
    };
  };

  // Configuration des sensors pour le drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Nécessite un déplacement de 10px avant de commencer le drag
      },
    })
  );

  // Filtrer les tâches par recherche ET par priorité
  const filteredTasks = tasks.filter((task) => {
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchSearch = 
        task.title.toLowerCase().includes(search) ||
        task.description?.toLowerCase().includes(search);
      if (!matchSearch) return false;
    }

    // Filtre par priorité
    if (priorityFilter !== 'ALL') {
      return task.priority === priorityFilter;
    }

    return true;
  });

  // Trouver la tâche active pendant le drag
  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;

  /**
   * Gérer le début du drag
   */
  const handleDragStart = (event: any) => {
    setActiveTaskId(event.active.id);
  };

  /**
   * Gérer la fin du drag
   */
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTaskId(null);
      return;
    }

    const taskId = active.id;
    const newStatus = over.id as TaskStatus;

    // Si la tâche est déposée sur une nouvelle colonne
    if (newStatus && (newStatus === 'TODO' || newStatus === 'DOING' || newStatus === 'DONE')) {
      changeTaskStatus(taskId, newStatus);
    }

    setActiveTaskId(null);
  };

  /**
   * Annuler le drag
   */
  const handleDragCancel = () => {
    setActiveTaskId(null);
  };

  /**
   * Basculer l'expansion d'une colonne
   */
  const toggleColumnExpansion = (status: TaskStatus) => {
    setExpandedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  /**
   * Composant de carte draggable
   */
  const DraggableTaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
      data: { task },
    });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          opacity: isDragging ? 0.5 : 1,
          cursor: isDragging ? 'grabbing' : 'grab',
        }
      : undefined;

    return (
      <div ref={setNodeRef} style={style}>
        <Card
          size="small"
          hoverable
          style={{ marginBottom: 12 }}
          title={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space>
                <span {...listeners} {...attributes} style={{ cursor: 'grab', display: 'flex' }}>
                  <HolderOutlined />
                </span>
                <strong>{task.title}</strong>
              </Space>
              <Space wrap size={[4, 4]}>
                <Tag color={PRIORITY_COLORS[task.priority]}>{task.priority}</Tag>
                <Tag color={STATUS_COLORS[task.status]}>
                  {KANBAN_COLUMNS.find((col) => col.status === task.status)?.title}
                </Tag>
              </Space>
            </Space>
          }
          extra={
            <Space size="small">
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openEditModal(task)}
              />
              <Popconfirm
                title="Supprimer cette tâche ?"
                description={`Êtes-vous sûr de vouloir supprimer "${task.title}" ?`}
                onConfirm={() => deleteTask(task.id)}
                okText="Supprimer"
                cancelText="Annuler"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" icon={<DeleteOutlined />} size="small" danger />
              </Popconfirm>
            </Space>
          }
        >
          {task.description && (
            <div style={{ fontSize: '13px', color: '#666' }}>{task.description}</div>
          )}
          <div style={{ fontSize: '11px', color: '#999', marginTop: 8 }}>
            {new Date(task.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </Card>
      </div>
    );
  };

  /**
   * Composant de colonne droppable
   */
  const DroppableColumn: React.FC<{
    status: typeof KANBAN_COLUMNS[number];
    tasks: Task[];
  }> = ({ status, tasks: columnTasks }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status.status,
    });

    const priorityCounts = countByPriority(columnTasks);
    const sortedTasks = sortTasks(columnTasks);

    // Vérifier si la colonne est étendue
    const isExpanded = expandedColumns.has(status.status);
    const hasMoreTasks = sortedTasks.length > INITIAL_TASK_LIMIT;
    const displayedTasks = isExpanded ? sortedTasks : sortedTasks.slice(0, INITIAL_TASK_LIMIT);

    return (
      <Col key={status.status} xs={24} md={8}>
        <div ref={setNodeRef}>
          <Card
            title={
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {/* Ligne 1 : Titre + Total */}
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <span style={{ fontWeight: 600 }}>{status.title}</span>
                    <Tag color={status.color}>{columnTasks.length}</Tag>
                  </Space>
                </Space>

                {/* Ligne 2 : Compteurs par priorité */}
                <Space size={8}>
                  <Tag color={PRIORITY_COLORS.HIGH} style={{ margin: 0 }}>
                    🔴 {priorityCounts.HIGH}
                  </Tag>
                  <Tag color={PRIORITY_COLORS.MEDIUM} style={{ margin: 0 }}>
                    🟠 {priorityCounts.MEDIUM}
                  </Tag>
                  <Tag color={PRIORITY_COLORS.LOW} style={{ margin: 0 }}>
                    🟢 {priorityCounts.LOW}
                  </Tag>
                </Space>
              </Space>
            }
            bordered
            style={{
              height: '100%',
              minHeight: '500px',
              backgroundColor: isOver ? '#f0f5ff' : 'white',
              transition: 'background-color 0.2s ease',
            }}
            headStyle={{ backgroundColor: '#fafafa' }}
          >
            {sortedTasks.length > 0 ? (
              <>
                {displayedTasks.map((task) => (
                  <DraggableTaskCard key={task.id} task={task} />
                ))}
                
                {/* Bouton "Voir plus" si il y a plus de tâches */}
                {hasMoreTasks && !isExpanded && (
                  <Button
                    type="link"
                    onClick={() => toggleColumnExpansion(status.status)}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    Voir plus ({sortedTasks.length - INITIAL_TASK_LIMIT} restantes)
                  </Button>
                )}

                {/* Bouton "Voir moins" si la colonne est étendue */}
                {hasMoreTasks && isExpanded && (
                  <Button
                    type="link"
                    onClick={() => toggleColumnExpansion(status.status)}
                    style={{ width: '100%', marginTop: 8 }}
                  >
                    Voir moins
                  </Button>
                )}
              </>
            ) : (
              <Empty
                description="Aucune tâche"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ marginTop: 40 }}
              />
            )}
          </Card>
        </div>
      </Col>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Barre d'actions en haut */}
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        {/* Ligne 1 : Tri et Bouton Nouvelle Tâche */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Select de tri */}
          <Space>
            <span style={{ fontWeight: 500 }}>Trier par :</span>
            <Select
              value={sortType}
              onChange={setSortType}
              style={{ width: 200 }}
              options={[
                { value: 'priority-high-low', label: '🔴 Priorité (Haute → Basse)' },
                { value: 'priority-low-high', label: '🟢 Priorité (Basse → Haute)' },
                { value: 'date-newest', label: '📅 Plus récent' },
                { value: 'date-oldest', label: '📅 Plus ancien' },
                { value: 'title-asc', label: '🔤 Titre (A → Z)' },
                { value: 'title-desc', label: '🔤 Titre (Z → A)' },
              ]}
            />
          </Space>

          {/* Bouton Nouvelle Tâche */}
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Nouvelle tâche
          </Button>
        </div>

        {/* Ligne 2 : Filtres de priorité */}
        <div>
          <Space>
            <span style={{ fontWeight: 500 }}>Filtrer par priorité :</span>
            <Space.Compact>
              <Button
                type={priorityFilter === 'ALL' ? 'primary' : 'default'}
                onClick={() => setPriorityFilter('ALL')}
              >
                Toutes
              </Button>
              <Button
                danger={priorityFilter === 'HIGH'}
                type={priorityFilter === 'HIGH' ? 'primary' : 'default'}
                onClick={() => setPriorityFilter('HIGH')}
                style={{
                  backgroundColor: priorityFilter === 'HIGH' ? PRIORITY_COLORS.HIGH : undefined,
                  borderColor: PRIORITY_COLORS.HIGH,
                }}
              >
                🔴 HIGH
              </Button>
              <Button
                type={priorityFilter === 'MEDIUM' ? 'primary' : 'default'}
                onClick={() => setPriorityFilter('MEDIUM')}
                style={{
                  backgroundColor: priorityFilter === 'MEDIUM' ? PRIORITY_COLORS.MEDIUM : undefined,
                  borderColor: PRIORITY_COLORS.MEDIUM,
                  color: priorityFilter === 'MEDIUM' ? 'white' : undefined,
                }}
              >
                🟠 MEDIUM
              </Button>
              <Button
                type={priorityFilter === 'LOW' ? 'primary' : 'default'}
                onClick={() => setPriorityFilter('LOW')}
                style={{
                  backgroundColor: priorityFilter === 'LOW' ? PRIORITY_COLORS.LOW : undefined,
                  borderColor: PRIORITY_COLORS.LOW,
                  color: priorityFilter === 'LOW' ? 'white' : undefined,
                }}
              >
                🟢 LOW
              </Button>
            </Space.Compact>
          </Space>
        </div>
      </Space>

      {/* Les 3 colonnes Kanban */}
      <Row gutter={[16, 16]}>
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((task) => task.status === column.status);
          return <DroppableColumn key={column.status} status={column} tasks={columnTasks} />;
        })}
      </Row>

      {/* Overlay pendant le drag (preview de la carte) */}
      <DragOverlay>
        {activeTask ? (
          <Card
            size="small"
            style={{
              width: 300,
              opacity: 0.9,
              cursor: 'grabbing',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            <strong>{activeTask.title}</strong>
          </Card>
        ) : null}
      </DragOverlay>

      {/* Modal de création/édition */}
      <TaskModal
        open={isModalOpen}
        editingTask={editingTask}
        onSave={submitTaskForm}
        onCancel={closeModal}
        tasks={tasks}
      />
    </DndContext>
  );
};
