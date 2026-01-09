/**
 * KanbanBoard - Composant principal du tableau Kanban
 * Composant autonome qui utilise useTaskBoard et gère tout l'affichage
 * Strictement Ant Design v5 - Pas de CSS custom
 */

import { Row, Col, Card, Tag, Button, Space, Popconfirm, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { TaskModal } from './TaskModal';
import { KANBAN_COLUMNS } from '../types/task.types';
import type { Task } from '../types/task.types';

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
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  } = useTaskBoard();

  // Filtrer les tâches par recherche
  const filteredTasks = tasks.filter((task) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search)
    );
  });

  /**
   * Rendre une carte de tâche
   */
  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      size="small"
      hoverable
      style={{ marginBottom: 12 }}
      title={
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <strong>{task.title}</strong>
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
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      }
    >
      {task.description && (
        <div style={{ fontSize: '13px', color: '#666' }}>
          {task.description}
        </div>
      )}
      <div style={{ fontSize: '11px', color: '#999', marginTop: 8 }}>
        {new Date(task.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </div>
    </Card>
  );

  /**
   * Rendre une colonne Kanban
   */
  const renderColumn = (status: typeof KANBAN_COLUMNS[number]) => {
    const columnTasks = filteredTasks.filter((task) => task.status === status.status);

    return (
      <Col key={status.status} xs={24} md={8}>
        <Card
          title={
            <Space>
              <span style={{ fontWeight: 600 }}>{status.title}</span>
              <Tag color={status.color}>{columnTasks.length}</Tag>
            </Space>
          }
          bordered
          style={{ height: '100%', minHeight: '500px' }}
          headStyle={{ backgroundColor: '#fafafa' }}
        >
          {columnTasks.length > 0 ? (
            columnTasks.map(renderTaskCard)
          ) : (
            <Empty
              description="Aucune tâche"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 40 }}
            />
          )}
        </Card>
      </Col>
    );
  };

  return (
    <>
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
        {KANBAN_COLUMNS.map(renderColumn)}
      </Row>

      {/* Modal de création/édition */}
      <TaskModal
        open={isModalOpen}
        editingTask={editingTask}
        onSave={submitTaskForm}
        onCancel={closeModal}
      />
    </>
  );
};
