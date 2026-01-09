/**
 * KanbanBoard - Composant principal du tableau Kanban
 * Composant autonome qui utilise useTaskBoard et gère tout l'affichage
 * Strictement Ant Design v5 - Pas de CSS custom
 * Drag & Drop avec @dnd-kit/core
 */

import { Row, Col, Card, Tag, Button, Space, Popconfirm, Empty } from 'antd';
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
import { useState } from 'react';
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

  // Configuration des sensors pour le drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Nécessite un déplacement de 10px avant de commencer le drag
      },
    })
  );

  // Filtrer les tâches par recherche
  const filteredTasks = tasks.filter((task) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search)
    );
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

    return (
      <Col key={status.status} xs={24} md={8}>
        <div ref={setNodeRef}>
          <Card
            title={
              <Space>
                <span style={{ fontWeight: 600 }}>{status.title}</span>
                <Tag color={status.color}>{columnTasks.length}</Tag>
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
            {columnTasks.length > 0 ? (
              columnTasks.map((task) => <DraggableTaskCard key={task.id} task={task} />)
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
      {/* Bouton Nouvelle Tâche */}
      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Nouvelle tâche
        </Button>
      </div>

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
      />
    </DndContext>
  );
};
