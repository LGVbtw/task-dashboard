/**
 * Composant principal du tableau Kanban
 * Affiche les 3 colonnes (TODO, DOING, DONE) avec drag & drop
 */

import { Row, Col } from 'antd';
import { KanbanColumn } from './KanbanColumn';
import { KANBAN_COLUMNS } from '../../types/task.types';
import type { Task, TaskStatus } from '../../types/task.types';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
}) => {
  return (
    <Row gutter={16}>
      {KANBAN_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <Col key={column.status} xs={24} md={8}>
            <KanbanColumn
              column={column}
              tasks={columnTasks}
              onTaskMove={onTaskMove}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
            />
          </Col>
        );
      })}
    </Row>
  );
};
