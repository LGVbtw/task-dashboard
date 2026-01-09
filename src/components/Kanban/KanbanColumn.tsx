/**
 * Composant d'une colonne Kanban
 * Représente une colonne du tableau (TODO, DOING ou DONE)
 */

import { Card, Space, Badge } from 'antd';
import { TaskCard } from './TaskCard';
import type { Task, KanbanColumn as KanbanColumnType, TaskStatus } from '../../types/task.types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
}) => {
  return (
    <Card
      title={
        <Space>
          <span>{column.title}</span>
          <Badge
            count={tasks.length}
            style={{ backgroundColor: column.color }}
          />
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onTaskMove}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
          />
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
            Aucune tâche
          </div>
        )}
      </Space>
    </Card>
  );
};
