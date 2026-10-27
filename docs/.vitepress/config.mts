import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'QA Wiki',
  description: 'Validation references, test data and automation notes',
  // GitHub Pages: /repo-name/  |  Own server at domain root: '/'
  base: process.env.BASE_PATH || '/',
  lang: 'en-IN',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Ashley', link: '/ashley/unifi-validation' },
      { text: 'Test data', link: '/test-data/' }
    ],

    // Each section gets its own sidebar
    sidebar: {
      '/ashley/': [
        {
          text: 'Synchrony UniFi',
          items: [
            { text: 'QA Validation Reference', link: '/ashley/unifi-validation' }
            // add more pages here
          ]
        }
      ],
      '/test-data/': [
        {
          text: 'Test data',
          items: [{ text: 'Overview', link: '/test-data/' }]
        }
      ]
    },

    outline: { level: [2, 3], label: 'On this page' },
    search: { provider: 'local' },
    docFooter: { prev: 'Previous', next: 'Next' },
    socialLinks: [
      // { icon: 'github', link: 'https://github.com/<you>/qa-wiki' }
    ],
    footer: { message: 'Internal QA reference', copyright: 'D4 Insight' }
  }
})
