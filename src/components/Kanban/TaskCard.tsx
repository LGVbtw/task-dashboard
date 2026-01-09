/**
 * Composant d'une carte de tâche
 * Représente une tâche individuelle dans le Kanban
 */

import { Card, Tag, Space, Button, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Task, TaskStatus } from '../../types/task.types';
import { TASK_STATUS } from '../../types/task.types';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_COLORS = {
  LOW: 'green',
  MEDIUM: 'orange',
  HIGH: 'red',
} as const;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onMove,
  onEdit,
  onDelete,
}) => {
  // Menu de déplacement
  const moveMenuItems: MenuProps['items'] = Object.keys(TASK_STATUS)
    .filter((status) => status !== task.status)
    .map((status) => ({
      key: status,
      label: `Déplacer vers "${TASK_STATUS[status as TaskStatus]}"`,
      onClick: () => onMove(task.id, status as TaskStatus),
    }));

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: 'Modifier',
      icon: <EditOutlined />,
      onClick: () => onEdit(task),
    },
    {
      type: 'divider',
    },
    {
      key: 'move',
      label: 'Déplacer',
      children: moveMenuItems,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Supprimer',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(task.id),
    },
  ];

  return (
    <Card
      size="small"
      hoverable
      extra={
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <strong>{task.title}</strong>
        {task.description && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            {task.description}
          </div>
        )}
        <Tag color={PRIORITY_COLORS[task.priority]}>
          {task.priority}
        </Tag>
      </Space>
    </Card>
  );
};
