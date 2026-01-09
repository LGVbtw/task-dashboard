/**
 * Modal de confirmation de suppression d'une tâche
 */

import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmDeleteModalProps {
  open: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  taskTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      title={
        <>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
          Confirmer la suppression
        </>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Supprimer"
      cancelText="Annuler"
      okButtonProps={{ danger: true }}
    >
      <p>
        Êtes-vous sûr de vouloir supprimer la tâche <strong>"{taskTitle}"</strong> ?
      </p>
      <p style={{ color: '#999', fontSize: '14px' }}>
        Cette action est irréversible.
      </p>
    </Modal>
  );
};
