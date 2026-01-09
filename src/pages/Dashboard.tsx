/**
 * Page Dashboard - Vue principale avec le Kanban
 */

import { useState } from 'react';
import { Layout, Input, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { KanbanBoard } from '../components/KanbanBoard';

const { Header, Content } = Layout;
const { Title } = Typography;

export const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          📋 Task Dashboard
        </Title>
        <Input
          placeholder="Rechercher une tâche..."
          prefix={<SearchOutlined />}
          style={{ maxWidth: 400 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
        />
      </Header>

      <Content style={{ padding: '24px' }}>
        <KanbanBoard searchTerm={searchTerm} />
      </Content>
    </Layout>
  );
};
