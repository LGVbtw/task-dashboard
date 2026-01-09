/**
 * Page Dashboard - Vue principale avec Statistiques et Kanban
 */

import { useState } from 'react';
import { Layout, Input, Typography, Space, Button, Avatar, Breadcrumb, Card, theme, Col, Row, Statistic } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  LayoutOutlined, 
  BellOutlined, 
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { KanbanBoard } from '../components/KanbanBoard';
import { useTaskBoard } from '../hooks/useTaskBoard';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const { token } = theme.useToken();
  const [searchTerm, setSearchTerm] = useState('');
  const { tasks } = useTaskBoard();

  // Calculer les statistiques dynamiquement
  const todoCount = tasks.filter(task => task.status === 'TODO').length;
  const doingCount = tasks.filter(task => task.status === 'DOING').length;
  const doneCount = tasks.filter(task => task.status === 'DONE').length;

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      {/* HEADER */}
      <Header style={{ 
        background: '#fff', 
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
              display: 'flex',
              boxShadow: `0 2px 8px ${token.colorPrimary}40`
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
          <Space size="small" style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '8px', transition: 'all 0.3s' }} className="user-profile">
            <Text strong>Yanis</Text>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: token.colorPrimary }} />
          </Space>
        </Space>
      </Header>

      <Content style={{ padding: '32px 40px' }}>
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          
          {/* SECTION RECHERCHE ET DESCRIPTION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Suivez l'avancement de vos tâches en temps réel.
              </Text>
            </div>
            
            <Space size="middle">
              <Input
                placeholder="Rechercher une tâche..."
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                style={{ 
                    width: 320, 
                    height: 40, 
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)' 
                }}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                value={searchTerm}
              />
            </Space>
          </div>

          {/* CARTES DE STATISTIQUES */}
          <Row gutter={24}>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Statistic
                  title="Tâches en attente"
                  value={todoCount}
                  prefix={<ClockCircleOutlined style={{ color: token.colorWarning, marginRight: 8 }} />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Statistic
                  title="En cours"
                  value={doingCount}
                  prefix={<SyncOutlined spin style={{ color: token.colorPrimary, marginRight: 8 }} />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Statistic
                  title="Terminées"
                  value={doneCount}
                  prefix={<CheckCircleOutlined style={{ color: token.colorSuccess, marginRight: 8 }} />}
                />
              </Card>
            </Col>
          </Row>

          {/* ZONE KANBAN */}
          <div style={{ 
            background: 'rgba(0,0,0,0.01)', 
            borderRadius: '16px', 
            padding: '8px',
            border: `1px dashed ${token.colorBorderSecondary}`
          }}>
            <KanbanBoard searchTerm={searchTerm} />
          </div>

        </Space>
      </Content>
    </Layout>
  );
};