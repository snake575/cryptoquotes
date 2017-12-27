import Vue from 'vue'
import VueHighcharts from 'vue-highcharts'
import Highcharts from 'highcharts'
import loadStock from 'highcharts/modules/stock'
import loadHighchartsMore from 'highcharts/highcharts-more'
import theme from '~/assets/highcharts-dark.js'

loadStock(Highcharts)
loadHighchartsMore(Highcharts)

// Apply the theme
Highcharts.setOptions(theme)

Vue.use(VueHighcharts, { Highcharts })
