/**
 * Page Dashboard - Vue principale avec le Kanban
 */

import { useState } from 'react';
import { Layout, Button, Space, Typography, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTasks } from '../hooks/useTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { KanbanBoard } from '../components/Kanban/KanbanBoard';
import { TaskFormModal } from '../components/Modals/TaskFormModal';
import { ConfirmDeleteModal } from '../components/Modals/ConfirmDeleteModal';
import type { Task, CreateTaskDTO, TaskStatus } from '../types/task.types';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    getTaskById,
  } = useTasks();

  const { filteredTasks, setSearchTerm } = useTaskFilters(tasks);

  // États pour les modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>();
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>();

  // Handlers pour le formulaire
  const handleOpenCreateModal = () => {
    setTaskToEdit(undefined);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: CreateTaskDTO) => {
    if (taskToEdit) {
      // Mise à jour
      updateTask({ ...data, id: taskToEdit.id });
    } else {
      // Création
      createTask(data);
    }
    setIsFormModalOpen(false);
    setTaskToEdit(undefined);
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setTaskToEdit(undefined);
  };

  // Handlers pour la suppression
  const handleOpenDeleteModal = (taskId: string) => {
    const task = getTaskById(taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setIsDeleteModalOpen(false);
      setTaskToDelete(undefined);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(undefined);
  };

  // Handler pour le déplacement de tâche
  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    changeTaskStatus(taskId, newStatus);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>
          📋 Task Dashboard
        </Title>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Barre d'actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input
              placeholder="Rechercher une tâche..."
              prefix={<SearchOutlined />}
              style={{ maxWidth: 400 }}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              size="large"
            >
              Nouvelle tâche
            </Button>
          </div>

          {/* Tableau Kanban */}
          <KanbanBoard
            tasks={filteredTasks}
            onTaskMove={handleTaskMove}
            onTaskEdit={handleOpenEditModal}
            onTaskDelete={handleOpenDeleteModal}
          />
        </Space>
      </Content>

      {/* Modals */}
      <TaskFormModal
        open={isFormModalOpen}
        task={taskToEdit}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        taskTitle={taskToDelete?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Layout>
  );
};
