/**
 * TaskModal - Modal de création/édition de tâche
 * Utilise strictement Ant Design v5 (pas de CSS custom)
 */

import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import type { Task, CreateTaskDTO, TaskStatus, TaskPriority } from '../types/task.types';

interface TaskModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (data: CreateTaskDTO) => void;
  editingTask?: Task;
}

const { TextArea } = Input;

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onCancel,
  onSave,
  editingTask,
}) => {
  const [form] = Form.useForm();

  const isEditMode = !!editingTask;

  /**
   * Pré-remplir le formulaire quand on édite une tâche
   */
  useEffect(() => {
    if (open) {
      if (editingTask) {
        form.setFieldsValue({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
        });
      } else {
        // Valeurs par défaut pour une nouvelle tâche
        form.setFieldsValue({
          status: 'TODO' as TaskStatus,
          priority: 'LOW' as TaskPriority,
        });
      }
    }
  }, [open, editingTask, form]);

  /**
   * Soumettre le formulaire
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const taskData: CreateTaskDTO = {
        title: values.title,
        description: values.description || undefined,
        status: values.status,
        priority: values.priority,
      };
      onSave(taskData);
      form.resetFields();
    } catch (error) {
      console.error('Validation échouée:', error);
    }
  };

  /**
   * Annuler et fermer la modal
   */
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
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'TODO' as TaskStatus,
          priority: 'MEDIUM' as TaskPriority,
        }}
      >
        <Form.Item
          name="title"
          label="Titre"
          rules={[
            { required: true, message: 'Le titre est obligatoire' },
            { min: 3, message: 'Le titre doit contenir au moins 3 caractères' },
            { max: 100, message: 'Le titre ne peut pas dépasser 100 caractères' },
          ]}
        >
          <Input 
            placeholder="Ex: Implémenter l'authentification" 
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: 'La description ne peut pas dépasser 500 caractères' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Détails de la tâche..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Statut"
          rules={[{ required: true, message: 'Le statut est obligatoire' }]}
        >
          <Select placeholder="Sélectionner un statut">
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
          <Select placeholder="Sélectionner une priorité">
            <Select.Option value="LOW">Basse</Select.Option>
            <Select.Option value="MEDIUM">Moyenne</Select.Option>
            <Select.Option value="HIGH">Haute</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
