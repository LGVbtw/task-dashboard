/**
 * Configuration du thème Ant Design
 */

import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Couleur principale (Bleu moderne)
    colorPrimary: '#1677ff',
    
    // Changement du fond global (Gris bleuté très léger)
    // C'est ce qui va faire ressortir tes colonnes blanches !
    colorBgLayout: '#f5f7fa', 
    
    // Rayon des bordures plus moderne
    borderRadius: 8,
    
    // Typographie
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    
    // Personnalisation des ombres (Mission B1)
    boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 64,
      // On s'assure que le fond du layout utilise bien notre couleur grise
      bodyBg: '#f5f7fa', 
    },
    Card: {
      // Les cartes restent blanches sur le fond gris
      colorBgContainer: '#ffffff', 
      headerFontSize: 16,
      fontWeightStrong: 600,
    },
    Button: {
      fontWeight: 500,
      controlHeight: 36,
    },
    Input: {
      controlHeight: 36,
    }
  },
};
