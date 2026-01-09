/**
 * Modal de formulaire pour créer/éditer une tâche
 */

import { Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { Task, CreateTaskDTO, TaskStatus, TaskPriority } from '../../types/task.types';

interface TaskFormModalProps {
  open: boolean;
  task?: Task; // Si présent, on est en mode édition
  onSubmit: (data: CreateTaskDTO) => void;
  onCancel: () => void;
}

const { TextArea } = Input;

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  task,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const isEditMode = !!task;

  // Initialiser le formulaire avec les données de la tâche
  const initialValues = task
    ? {
        ...task,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
      }
    : {
        status: 'TODO' as TaskStatus,
        priority: 'MEDIUM' as TaskPriority,
      };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const formData: CreateTaskDTO = {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      onSubmit(formData);
      form.resetFields();
    } catch (error) {
      console.error('Validation échouée:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEditMode ? 'Modifier' : 'Créer'}
      cancelText="Annuler"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="title"
          label="Titre"
          rules={[
            { required: true, message: 'Le titre est obligatoire' },
            { min: 3, message: 'Le titre doit contenir au moins 3 caractères' },
          ]}
        >
          <Input placeholder="Ex: Implémenter l'authentification" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            rows={4}
            placeholder="Détails de la tâche..."
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Statut"
          rules={[{ required: true, message: 'Le statut est obligatoire' }]}
        >
          <Select>
            <Select.Option value="TODO">À faire</Select.Option>
            <Select.Option value="DOING">En cours</Select.Option>
            <Select.Option value="DONE">Terminé</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priorité"
          rules={[{ required: true, message: 'La priorité est obligatoire' }]}
        >
          <Select>
            <Select.Option value="LOW">Basse</Select.Option>
            <Select.Option value="MEDIUM">Moyenne</Select.Option>
            <Select.Option value="HIGH">Haute</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Date d'échéance"
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Sélectionner une date"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
