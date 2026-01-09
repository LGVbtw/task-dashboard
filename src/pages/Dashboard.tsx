/**
 * Page Dashboard - Vue principale avec le Kanban
 */

import { useState } from 'react';
import { Layout, Input, Typography, Space, Button, Avatar, Breadcrumb, Card, theme } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LayoutOutlined, 
  BellOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { KanbanBoard } from '../components/KanbanBoard';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      {/* HEADER */}
      <Header style={{ 
        background: token.colorBgContainer, 
        padding: '0 40px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <Space size="large">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: token.colorPrimary, 
              padding: '6px', 
              borderRadius: '8px', 
              display: 'flex' 
            }}>
              <LayoutOutlined style={{ color: '#fff', fontSize: '20px' }} />
            </div>
            <Title level={4} style={{ margin: 0, letterSpacing: '-0.5px' }}>
              TaskFlow
            </Title>
          </div>
          
          <Breadcrumb 
            items={[
              { title: 'Workspace' },
              { title: 'Project Alpha' },
              { title: 'Kanban' },
            ]} 
            style={{ marginLeft: 20 }}
          />
        </Space>

        <Space size="middle">
          <Button type="text" icon={<BellOutlined />} />
          <Button type="text" icon={<SettingOutlined />} />
          <div style={{ width: '1px', height: '24px', background: token.colorBorder, margin: '0 8px' }} />
          <Space size="small" style={{ cursor: 'pointer' }}>
            <Text strong>Yanis</Text>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
          </Space>
        </Space>
      </Header>

      <Content style={{ padding: '32px 40px' }}>
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          
          {/* BARRE D'ENTÊTE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text 
                type="secondary" 
                style={{ fontSize: '18px', fontWeight: 400 }}
              >
                Gérez vos tâches et suivez l'avancement du projet en temps réel.
              </Text>
            </div>
            
            <Space size="middle">
              <Input
                placeholder="Rechercher une tâche..."
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                style={{ width: 300, height: 40 }}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                value={searchTerm}
              />
            </Space>
          </div>

          {/* ZONE KANBAN */}
          <Card 
            bordered={false} 
            style={{ background: 'transparent', padding: 0 }}
            bodyStyle={{ padding: 0 }}
          >
            <KanbanBoard searchTerm={searchTerm} />
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};
