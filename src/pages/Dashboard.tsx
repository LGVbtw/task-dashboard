/**
 * Page Dashboard - Vue principale avec le Kanban
 */

import { useState } from 'react';
import { Layout, Button, Space, Typography, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { ConfirmDeleteModal } from '../components/Modals/ConfirmDeleteModal';
import { TaskModal } from '../components/Modals/TaskModal';
import { KanbanBoard } from '../components/Kanban/KanbanBoard';
import type { Task } from '../types/task.types';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const {
    tasks,
    isModalOpen,
    editingTask,
    changeTaskStatus,
    deleteTask,
    openCreateModal,
    openEditModal,
    closeModal,
    submitTaskForm,
  } = useTaskBoard();

  // État local pour la recherche et la suppression
  const [searchTerm, setSearchTerm] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>();

  // Filtrage des tâches par recherche
  const filteredTasks = tasks.filter((task) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      task.title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search)
    );
  });

  // Handlers
  const handleOpenDeleteModal = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setTaskToDelete(task);
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(undefined);
    }
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              size="large"
            >
              Nouvelle tâche
            </Button>
          </div>

          {/* Tableau Kanban */}
          <KanbanBoard
            tasks={filteredTasks}
            onTaskMove={changeTaskStatus}
            onTaskEdit={openEditModal}
            onTaskDelete={handleOpenDeleteModal}
          />
        </Space>
      </Content>

      {/* Modals */}
      <TaskModal
        open={isModalOpen}
        editingTask={editingTask}
        onSave={submitTaskForm}
        onCancel={closeModal}
      />

      <ConfirmDeleteModal
        open={!!taskToDelete}
        taskTitle={taskToDelete?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(undefined)}
      />
    </Layout>
  );
};
