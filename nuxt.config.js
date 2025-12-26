import colors from 'vuetify/es5/util/colors'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  ssr: false,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s',
    title:'' ,
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/style'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/VueApexChart.js',
    '~/plugins/GoogleAnalytics.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/i18n',
    '@nuxtjs/router-extras',
    'cookie-universal-nuxt',
    'nuxt-gtag'
  ],

  gtag: {
    id: 'G-PWQK6WQ58Q'
  },

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en-US.js', dir: 'ltr'},
      { code: 'ru', iso: 'ru-RU', file: 'ru-RU.js', dir: 'ltr'},
      { code: 'tj', iso: 'tj-TJ', file: 'tj-TJ.js', dir: 'ltr'},
      { code: 'kg', iso: 'kg-KG', file: 'kg-KG.js', dir: 'ltr'},
    ],
    lazy: true,
    langDir: 'lang/',
    vueI18n: {
      fallbackLocale: 'ru'
    },
    defaultLocale: 'ru', // later remove this line, because detectBrowserLanguage option detects user's browser language and uses it as a default locale
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',  // recommended
    }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL: process.env.NODE_ENV === 'development'
      ? 'http://agroinform-prices-backend.test/api' // Local development backend
      : 'https://data.agroinform.asia/api' // Production API
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {}
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
  loading: {
    color: 'yellow darken-2',
    height: '3px'
  },
  publicRuntimeConfig: {
    baseURL: process.env.NODE_ENV === 'development'
      ? 'http://agroinform-prices-backend.test/api' // Local development backend
      : 'https://data.agroinform.asia/api', // Production API
    pdfServiceURL: process.env.NODE_ENV === 'development'
      ? 'http://localhost:3002' // Local PDF service
      : 'https://prices.agroinform.asia/api/pdf' // Production PDF service (via nginx proxy)
  },
}
