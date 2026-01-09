/**
 * TaskModal - Modal de création/édition de tâche
 * Utilise strictement Ant Design v5 (pas de CSS custom)
 * Validation de la Mission B3 (Accessibilité) et B1 (Thème AntD)
 */

import { Modal, Form, Input, Select, Space } from 'antd';
import { 
  EditOutlined, 
  PlusOutlined,
  FileTextOutlined, 
  CheckCircleOutlined, 
  FlagOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useEffect } from 'react';
import type { Task, CreateTaskDTO, TaskStatus, TaskPriority } from '../types/task.types';

interface TaskModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (data: CreateTaskDTO) => void;
  editingTask?: Task;
  tasks: Task[]; // Pour vérifier l'unicité du titre
}

const { TextArea } = Input;

export const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onCancel,
  onSave,
  editingTask,
  tasks,
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
      title={
        <Space>
          {isEditMode ? <EditOutlined /> : <PlusOutlined />}
          <span>{isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}</span>
        </Space>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={isEditMode ? 'Modifier' : 'Créer'}
      cancelText="Annuler"
      width={600}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'TODO' as TaskStatus,
          priority: 'MEDIUM' as TaskPriority,
        }}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="title"
          label={<Space><FileTextOutlined /> Titre</Space>}
          rules={[
            { required: true, message: 'Le titre est obligatoire' },
            { min: 3, message: 'Le titre doit contenir au moins 3 caractères' },
            { max: 100, message: 'Le titre ne peut pas dépasser 100 caractères' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                
                // Vérifier si le titre existe déjà (en excluant la tâche en cours d'édition)
                const titleExists = tasks.some(
                  (task) => 
                    task.title.toLowerCase() === value.toLowerCase() && 
                    task.id !== editingTask?.id
                );
                
                if (titleExists) {
                  return Promise.reject(new Error('Ce titre existe déjà, veuillez en choisir un autre'));
                }
                
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input 
            placeholder="Ex: Implémenter l'authentification" 
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={<Space><EditOutlined /> Description</Space>}
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
          label={<Space><CheckCircleOutlined /> Statut</Space>}
          rules={[{ required: true, message: 'Le statut est obligatoire' }]}
        >
          <Select placeholder="Sélectionner un statut">
            <Select.Option value="TODO">
              <Space><ClockCircleOutlined /> À faire</Space>
            </Select.Option>
            <Select.Option value="DOING">
              <Space><SyncOutlined spin /> En cours</Space>
            </Select.Option>
            <Select.Option value="DONE">
              <Space><CheckCircleOutlined style={{ color: '#52c41a' }} /> Terminé</Space>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label={<Space><FlagOutlined /> Priorité</Space>}
          rules={[{ required: true, message: 'La priorité est obligatoire' }]}
        >
          <Select placeholder="Sélectionner une priorité">
            <Select.Option value="LOW">
              <Space><FlagOutlined style={{ color: '#52c41a' }} /> Basse</Space>
            </Select.Option>
            <Select.Option value="MEDIUM">
              <Space><FlagOutlined style={{ color: '#faad14' }} /> Moyenne</Space>
            </Select.Option>
            <Select.Option value="HIGH">
              <Space><FlagOutlined style={{ color: '#ff4d4f' }} /> Haute</Space>
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
