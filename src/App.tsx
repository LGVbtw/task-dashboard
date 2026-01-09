/**
 * Composant principal de l'application
 */

import { ConfigProvider } from 'antd';
import frFR from 'antd/locale/fr_FR';
import { Dashboard } from './pages/Dashboard';
import { antdTheme } from './theme/antd-theme';

export const App: React.FC = () => {
  return (
    <ConfigProvider locale={frFR} theme={antdTheme}>
      <Dashboard />
    </ConfigProvider>
  );
};
