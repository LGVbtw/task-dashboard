/**
 * KanbanBoard - Composant principal du tableau Kanban
 * Strictement Ant Design v5
 * Drag & Drop avec @dnd-kit/core
 */

import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Popconfirm,
  Empty,
  Select,
  Typography,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { KANBAN_COLUMNS } from '../types/task.types';
import type { Task, TaskStatus } from '../types/task.types';

const { Text } = Typography;

/* =======================
   TYPES & CONSTANTES
======================= */

interface KanbanBoardProps {
  searchTerm?: string;
}

const PRIORITY_COLORS = {
  LOW: 'green',
  MEDIUM: 'orange',
  HIGH: 'red',
} as const;

const STATUS_COLORS = {
  TODO: '#f5222d',
  DOING: '#faad14',
  DONE: '#52c41a',
} as const;

type SortType =
  | 'priority-high-low'
  | 'priority-low-high'
  | 'date-newest'
  | 'date-oldest'
  | 'title-asc'
  | 'title-desc';

const SORT_STORAGE_KEY = 'kanban-sort-preference';
const PRIORITY_FILTER_STORAGE_KEY = 'kanban-priority-filter';
const INITIAL_TASK_LIMIT = 5;

/* =======================
   COMPOSANT PRINCIPAL
======================= */

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  searchTerm = '',
}) => {
  const {
    tasks,
    deleteTask,
    changeTaskStatus,
    openCreateModal,
    openEditModal,
  } = useTaskBoard();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const [sortType, setSortType] = useState<SortType>(() => {
    return (
      (localStorage.getItem(SORT_STORAGE_KEY) as SortType) ??
      'priority-high-low'
    );
  });

  const [priorityFilter, setPriorityFilter] = useState<
    'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  >(() => {
    return (
      (localStorage.getItem(
        PRIORITY_FILTER_STORAGE_KEY
      ) as 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') ?? 'ALL'
    );
  });

  const [expandedColumns, setExpandedColumns] = useState<
    Set<TaskStatus>
  >(new Set());

  /* =======================
     PERSISTENCE
  ======================= */

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, sortType);
  }, [sortType]);

  useEffect(() => {
    localStorage.setItem(
      PRIORITY_FILTER_STORAGE_KEY,
      priorityFilter
    );
  }, [priorityFilter]);

  /* =======================
     FILTRAGE & TRI
  ======================= */

  const sortTasks = (list: Task[]) => {
    const copy = [...list];
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    switch (sortType) {
      case 'priority-high-low':
        return copy.sort(
          (a, b) =>
            priorityOrder[b.priority] -
            priorityOrder[a.priority]
        );
      case 'priority-low-high':
        return copy.sort(
          (a, b) =>
            priorityOrder[a.priority] -
            priorityOrder[b.priority]
        );
      case 'date-newest':
        return copy.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
      case 'date-oldest':
        return copy.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );
      case 'title-asc':
        return copy.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
      case 'title-desc':
        return copy.sort((a, b) =>
          b.title.localeCompare(a.title)
        );
      default:
        return copy;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !task.title.toLowerCase().includes(search) &&
        !task.description?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (priorityFilter !== 'ALL') {
      return task.priority === priorityFilter;
    }
    return true;
  });

  /* =======================
     DRAG & DROP
  ======================= */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveTaskId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over) {
      changeTaskStatus(active.id, over.id as TaskStatus);
    }
    setActiveTaskId(null);
  };

  const toggleColumnExpansion = (status: TaskStatus) => {
    setExpandedColumns((prev) => {
      const next = new Set(prev);
      next.has(status)
        ? next.delete(status)
        : next.add(status);
      return next;
    });
  };

  /* =======================
     CARTE DRAGGABLE
  ======================= */

  const DraggableTaskCard: React.FC<{ task: Task }> = ({
    task,
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({ id: task.id });

    return (
      <div
        ref={setNodeRef}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'grab',
        }}
      >
        <Card
          size="small"
          style={{ marginBottom: 12 }}
          title={
            <Space direction="vertical" size={4}>
              <Space>
                <span {...listeners} {...attributes}>
                  <HolderOutlined />
                </span>
                <Text strong>{task.title}</Text>
              </Space>
              <Space>
                <Tag color={PRIORITY_COLORS[task.priority]}>
                  {task.priority}
                </Tag>
                <Tag color={STATUS_COLORS[task.status]}>
                  {
                    KANBAN_COLUMNS.find(
                      (c) => c.status === task.status
                    )?.title
                  }
                </Tag>
              </Space>
            </Space>
          }
          extra={
            <Space>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEditModal(task)}
              />
              <Popconfirm
                title="Supprimer cette tâche ?"
                onConfirm={() => deleteTask(task.id)}
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Space>
          }
        >
          {task.description && (
            <Text type="secondary">{task.description}</Text>
          )}
        </Card>
      </div>
    );
  };

  /* =======================
     COLONNE DROPPABLE
  ======================= */

  const DroppableColumn: React.FC<{
    column: (typeof KANBAN_COLUMNS)[number];
  }> = ({ column }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: column.status,
    });

    const columnTasks = sortTasks(
      filteredTasks.filter(
        (t) => t.status === column.status
      )
    );

    const isExpanded = expandedColumns.has(column.status);
    const visibleTasks = isExpanded
      ? columnTasks
      : columnTasks.slice(0, INITIAL_TASK_LIMIT);

    return (
      <Col xs={24} md={8}>
        <div ref={setNodeRef}>
          <Card
            title={
              <Space>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: column.color,
                    display: 'inline-block',
                  }}
                />
                <Text strong>{column.title}</Text>
                <Tag>{columnTasks.length}</Tag>
              </Space>
            }
            style={{
              minHeight: 520,
              backgroundColor: isOver ? '#f0f5ff' : '#fff',
              transition: 'background-color 0.2s',
            }}
          >
            {columnTasks.length ? (
              <>
                {visibleTasks.map((task) => (
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                  />
                ))}

                {columnTasks.length >
                  INITIAL_TASK_LIMIT && (
                  <Button
                    type="link"
                    block
                    onClick={() =>
                      toggleColumnExpansion(column.status)
                    }
                  >
                    {isExpanded
                      ? 'Voir moins'
                      : `Voir plus (${
                          columnTasks.length -
                          INITIAL_TASK_LIMIT
                        })`}
                  </Button>
                )}
              </>
            ) : (
              <Empty
                description="Aucune tâche"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </div>
      </Col>
    );
  };

  /* =======================
     RENDER
  ======================= */

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* BARRE D’ACTIONS */}
      <Space
        direction="vertical"
        size="middle"
        style={{ width: '100%', marginBottom: 24 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Space>
            <Text strong>Trier par :</Text>
            <Select
              value={sortType}
              onChange={setSortType}
              style={{ width: 220 }}
              options={[
                {
                  value: 'priority-high-low',
                  label: '🔴 Priorité (Haute → Basse)',
                },
                {
                  value: 'priority-low-high',
                  label: '🟢 Priorité (Basse → Haute)',
                },
                { value: 'date-newest', label: '📅 Plus récent' },
                { value: 'date-oldest', label: '📅 Plus ancien' },
                { value: 'title-asc', label: '🔤 Titre (A → Z)' },
                { value: 'title-desc', label: '🔤 Titre (Z → A)' },
              ]}
            />
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Nouvelle tâche
          </Button>
        </div>

        {/* FILTRE PRIORITÉ */}
        <Space>
          <Text strong>Filtrer par priorité :</Text>
          <Space.Compact>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(
              (p) => (
                <Button
                  key={p}
                  type={
                    priorityFilter === p ? 'primary' : 'default'
                  }
                  onClick={() => setPriorityFilter(p)}
                >
                  {p}
                </Button>
              )
            )}
          </Space.Compact>
        </Space>
      </Space>

      {/* COLONNES */}
      <Row gutter={[16, 16]}>
        {KANBAN_COLUMNS.map((column) => (
          <DroppableColumn
            key={column.status}
            column={column}
          />
        ))}
      </Row>
    </DndContext>
  );
};
