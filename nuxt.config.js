module.exports = {
  // Nuxt mode
  // https://nuxtjs.org/api/configuration-mode
  mode: 'spa',
  // Nuxt source directory
  // https://nuxtjs.org/api/configuration-srcdir
  srcDir: 'src/',
  // Router config
  // https://nuxtjs.org/api/configuration-router
  router: {},
  // Global style files
  // https://nuxtjs.org/api/configuration-css
  css: [
    'tachyons/css/tachyons.min.css',
    // 'tachyons-debug/css/tachyons-debug.min.css',
    'vue-multiselect/dist/vue-multiselect.min.css',
  ],
  // Loading progress-bar
  // https://nuxtjs.org/api/configuration-loading
  loading: {
    color: 'white',
  },
  // SPA loading indicator
  // https://nuxtjs.org/api/configuration-loading-indicator
  loadingIndicator: {
    name: 'folding-cube',
    color: 'white',
    background: 'black',
  },
  // Plugins configuration
  // https://nuxtjs.org/api/configuration-plugins
  plugins: [
    '~/plugins/highcharts.js',
    '~/plugins/webFontLoader.js',
  ],
  // Modules configuration
  // https://nuxtjs.org/api/configuration-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/webpackmonitor',
  ],
  // Enviroment variables
  // https://nuxtjs.org/api/configuration-env
  env: {},
  // Build configuration
  // https://nuxtjs.org/api/configuration-build
  build: {
    // Extend the webpack configuration
    extend(config, { dev, client }) {
      // Run ESLINT on save
      if (dev && client) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }
      // Generate source maps as source-map
      if (dev) {
        config.devtool = 'source-map' // eslint-disable-line no-param-reassign
      }
    },
  },
  // Nuxt PWA module manifest configuration
  // https://github.com/nuxt-community/pwa-module#-manifest-module
  manifest: {
    name: 'CryptoQuotes',
    short_name: 'CryptoQuotes',
    lang: 'en-US',
    display: 'minimal-ui',
    start_url: '/',
  },
  // Nuxt Axios module configuration
  // https://github.com/nuxt-community/axios-module#options
  axios: {
    baseURL: 'https://7vb7k3j4rb.execute-api.us-east-1.amazonaws.com/dev/',
    credentials: false,
  },
}
