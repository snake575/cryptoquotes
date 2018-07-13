<template lang='pug'>
.flex.flex-column
  .flex.flex-wrap.items-center.b--white-20
    multiselect.dib.bb.br.b--white-20.min-width-150(
      v-model='marketOption'
      v-bind='marketProps'
    )
    template(v-for='(option, index) in exchanges')
      multiselect.dib.bb.br.b--white-20.min-width-150(
        :key='(option ? option.name : null)'
        :index='index'
        v-model='exchanges[index]'
        v-bind='exchangeProps'
        @close='removeExchange(index)'
      )
    a.inline-flex.items-center.bb.br.b--white-20.no-underline.bg-animate.hover-bg-gray.pa2(
      @click='addExchange()'
    )
      img.icon(:src='plusIcon')
    multiselect.dib.bb.br.b--white-20(
      v-model='timeKeyOption'
      v-bind='timeKeyProps'
    )
    .dib.bb.br.b--white-20
      .pl3
        .pt2.label.white-40.f8 Rotate market
        .flex
          toggle-button.toggle(
            v-model='rotateMarket'
            :height='11' :width='32'
            :color="{ unchecked: '#242424' }"
          )
          v-multiselect(
            v-model='rotateMarketInterval'
            label='label'
            trackBy='label'
            :options='intervalOptions'
            :searchable='false'
            :show-labels='false'
            :allow-empty='false'
          )
    .flex-auto.bb.b--white-20.pv2.ph3
      .flex.items-center
        template(v-for='(exchange, index) in cryptowatchExchanges')
          .dib.pr2.white-40
            | {{ exchange.label }}
            | {{ marketOption.currencies[1] | upper }}({{ marketOption.convert | upper }})
          .dib(:class="[ index > 0 ? 'pr1' : 'pr3' ]") {{ cryptowatchPrices[index] | number }}
          .dib.white-40.pr3(v-if='index > 0') {{ cryptowatchPriceOffsets[index] | percent }}
        template(v-for='(exchange, index) in quotesExchanges')
          .flex.items-center
            .dib.pr2.white-40 {{ exchange.label }} {{ marketOption.convert | upper }}
            .dib.pr3
              div
                .dib.pr1 {{ quotesPrices[index].buy | number }}
                .dib.white-40.pr1 {{ quotesPriceOffsets[index].buy | percent }}
                .dib.white-40 (Buy)
              .pt1
                .dib.pr1 {{ quotesPrices[index].sell | number }}
                .dib.white-40.pr1 {{ quotesPriceOffsets[index].sell | percent }}
                .dib.white-40 (Sell)
  .flex.flex-auto
    highstock.flex-auto.br.b--white-20(
      id='chart'
      :options='chartOptions'
    )
</template>

<script>
import Multiselect from '~/components/Multiselect'
import plusIcon from '~/assets/plus.svg'

// Range selector buttons
const buttons = [
  { type: 'hour', count: 12, text: '12H' },
  { type: 'day', count: 1, text: '1D' },
  { type: 'week', count: 1, text: '1W' },
  { type: 'month', count: 1, text: '1M' },
  { type: 'month', count: 3, text: '3M' },
  { type: 'month', count: 6, text: '6M' },
  { type: 'ytd', text: 'YTD' },
  { type: 'year', count: 1, text: '1Y' },
  { type: 'all', text: 'All' },
]

export default {
  components: { Multiselect },
  watchQuery: true,
  async asyncData({ store, query }) {
    // Default options
    let marketOption = store.state.marketOptions[0]
    let timeKeyOption = store.state.timeKeyOptions[2]
    let rotateMarket = false
    let rotateMarketInterval = store.state.intervalOptions[0]
    // Query string options
    const {
      exchange = [store.state.cryptowatchExchanges[0].name],
      market = marketOption.name,
      timekey = timeKeyOption.label,
      rotate = rotateMarket,
      interval = rotateMarketInterval.label,
    } = query
    // Set market option
    marketOption = store.getters.getMarketOption(market)
    // Set time key option
    timeKeyOption = store.getters.getTimeKeyOption(timekey)
    // Set rotation option
    rotateMarket = JSON.parse(rotate)
    rotateMarketInterval = store.getters.getIntervalOption(interval)
    // Set exchange options
    const { markets } = marketOption
    store.commit('setExchangeOptions', markets)
    // Set exchanges
    let { cryptowatchExchanges, quotesExchanges } = store.state
    cryptowatchExchanges = cryptowatchExchanges.filter(e => exchange.includes(e.name))
    quotesExchanges = quotesExchanges.filter(e => exchange.includes(e.name))
    const allExchanges = [...cryptowatchExchanges, ...quotesExchanges]
    const exchangesList = [...new Set(exchange)]
    const exchanges = exchangesList.map(e1 => allExchanges.find(e2 => e2.name === e1))
    // Fetch exchanges data
    await Promise.all([
      ...cryptowatchExchanges.map(ex => (
        store.dispatch('fetchCryptowatchExchangeData', {
          exchange: ex.name,
          market: marketOption.markets[0],
          convert: marketOption.convert,
        })
      )),
      ...quotesExchanges.map(ex => (
        store.dispatch('fetchQuotesExchangeData', {
          exchange: ex.name,
          market: marketOption.markets[1],
        })
      )),
      store.dispatch('fetchPrice', {
        exchange: 'oxr',
        market: 'usdclp',
      }),
    ])
    // Return data
    return {
      marketOption,
      timeKeyOption,
      rotateMarket,
      rotateMarketInterval,
      exchanges,
      exchangesList,
    }
  },
  filters: {
    upper(value) {
      if (!value) return ''
      return value.toString().toUpperCase()
    },
    capitalize(value) {
      if (!value) return ''
      return value.toString().charAt(0).toUpperCase() + value.slice(1)
    },
    number(value) {
      if (!value) return ''
      return parseFloat(value).toLocaleString()
    },
    percent(value) {
      if (!value) return ''
      return parseFloat(value).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 })
    },
  },
  data() {
    const {
      marketOptions,
      timeKeyOptions,
      intervalOptions,
      exchangeOptions,
    } = this.$store.state
    return {
      // Icon
      plusIcon,
      // Market
      marketProps: {
        label: 'Market',
        labelBy: 'label',
        trackBy: 'label',
        placeholder: 'Select a market',
        options: marketOptions,
      },
      // Market rotation
      intervalOptions,
      rotateMarketIntervalId: null,
      // Exchanges
      exchangeProps: {
        label: 'Exchange',
        labelBy: 'label',
        trackBy: 'name',
        placeholder: 'Select a exchange',
        options: exchangeOptions,
        hasClose: true,
      },
      // Time key
      timeKeyProps: {
        label: 'Time',
        labelBy: 'label',
        trackBy: 'label',
        options: timeKeyOptions,
      },
      // Chart
      chartOptions: {
        rangeSelector: {
          selected: 0,
          buttons,
        },
        yAxis: [{
          labels: {
            align: 'left',
            y: 3,
          },
          title: {
            text: 'Price',
          },
          height: '78%',
          resize: {
            enabled: true,
          },
        }, {
          labels: {
            align: 'left',
            y: 3,
          },
          title: {
            text: 'Offset',
          },
          top: '80%',
          height: '20%',
          offset: 0,
        }],
        series: [],
        tooltip: {
          valueDecimals: 2,
          split: false,
          shared: true,
        },
      },
    }
  },
  computed: {
    query() {
      return {
        exchange: this.exchangesList,
        convert: this.marketOption.convert,
        market: this.marketOption.name,
        timekey: this.timeKeyOption.label,
        rotate: this.rotateMarket,
        interval: this.rotateMarketInterval.label,
      }
    },
    cryptowatchMarket() {
      return this.marketOption.markets[0]
    },
    quotesMarket() {
      return this.marketOption.markets[1]
    },
    cryptowatchExchanges() {
      return this.filterExchanges(this.$store.state.cryptowatchExchanges)
    },
    quotesExchanges() {
      return this.filterExchanges(this.$store.state.quotesExchanges)
    },
    referenceExchange() {
      return this.exchanges[0]
    },
    referenceIsQuotes() {
      return this.referenceExchange.source === 'quotes'
    },
    referenceExchangeMarket() {
      return this.referenceIsQuotes ? this.quotesMarket : this.cryptowatchMarket
    },
    cryptowatchPriceSeries() {
      return this.filterExchangeList(this.cryptowatchExchanges, (ex) => {
        const market = this.cryptowatchMarket
        const { data } = this.$store.getters.getCryptowatchExchangeData(ex.name, market)
        return {
          data: this.getPriceData(data),
          name: ex.label,
          color: ex.color,
          type: 'line',
          marker: {
            symbol: 'circle',
          },
          yAxis: 0,
        }
      })
    },
    quotesPriceSeries() {
      return this.filterExchangeList(this.quotesExchanges, (ex) => {
        const market = this.quotesMarket
        const { buy, sell } = this.$store.getters.getQuotesExchangeData(ex.name, market)
        return {
          buy: {
            data: this.getPriceData(buy),
            name: `${ex.label} Buy`,
            color: ex.color[0],
            type: 'line',
            dashStyle: 'ShortDash',
            marker: {
              symbol: 'triangle',
            },
            yAxis: 0,
          },
          sell: {
            data: this.getPriceData(sell),
            name: `${ex.label} Sell`,
            color: ex.color[1],
            type: 'line',
            dashStyle: 'ShortDash',
            marker: {
              symbol: 'triangle-down',
            },
            yAxis: 0,
          },
        }
      })
    },
    cryptowatchPrices() {
      return this.filterExchangeList(this.cryptowatchExchanges, ex => (
        this.$store.getters.getCryptowatchExchangePrice(ex.name, this.cryptowatchMarket)
      ))
    },
    quotesPrices() {
      return this.filterExchangeList(this.quotesExchanges, ex => ({
        buy: this.$store.getters.getQuotesExchangePrice(ex.name, this.quotesMarket, 'buy'),
        sell: this.$store.getters.getQuotesExchangePrice(ex.name, this.quotesMarket, 'sell'),
      }))
    },
    referencePriceData() {
      let data = this.referenceExchange.getData(this.referenceExchangeMarket)
      data = this.referenceIsQuotes ? data.buy : data.data
      return this.getPriceData(data)
    },
    referencePrice() {
      return this.referenceExchange.getPrice(this.referenceExchangeMarket)
    },
    cryptowatchOffsetSeries() {
      return this.cryptowatchPriceSeries.map(item => ({
        ...item,
        data: this.getOffsetData(item.data),
        name: `${item.name} Offset`,
        yAxis: 1,
        tooltip: {
          valueSuffix: '%',
        },
      }))
    },
    quotesOffsetSeries() {
      return this.quotesPriceSeries.map(({ buy, sell }) => ({
        buy: {
          ...buy,
          data: this.getOffsetData(buy.data),
          name: `${buy.name} Offset`,
          yAxis: 1,
          tooltip: {
            valueSuffix: '%',
          },
        },
        sell: {
          ...sell,
          data: this.getOffsetData(sell.data),
          name: `${sell.name} Offset`,
          yAxis: 1,
          tooltip: {
            valueSuffix: '%',
          },
        },
      }))
    },
    cryptowatchPriceOffsets() {
      return this.cryptowatchPrices.map(price => (
        (price / this.referencePrice) - 1
      ))
    },
    quotesPriceOffsets() {
      return this.quotesPrices.map(({ buy, sell }) => ({
        buy: (buy / this.referencePrice) - 1,
        sell: (sell / this.referencePrice) - 1,
      }))
    },
  },
  watch: {
    exchanges(value) {
      value.filter(e => !!e).forEach((e, index) => {
        if (this.exchangesList[index] !== e.name) {
          this.exchangesList.splice(index, 1, e.name)
        }
      })
    },
    exchangesList() {
      this.reload()
    },
    marketOption() {
      this.reload()
    },
    timeKeyOption() {
      this.reload()
    },
    rotateMarket() {
      this.updateMarketRotation()
    },
  },
  mounted() {
    this.updateChart()
    this.updateMarketRotation()
  },
  methods: {
    addExchange(ex) {
      this.exchanges.push(ex)
    },
    removeExchange(index) {
      this.exchanges.splice(index, 1)
      this.exchangesList.splice(index, 1)
    },
    filterExchanges(exchanges) {
      return exchanges.filter(e => this.exchangesList.includes(e.name))
    },
    filterExchangeList(exchanges, callback) {
      return this.exchangesList.map((name, index) => {
        const ex = exchanges.find(e => e.name === name)
        if (!ex) return null
        return callback(ex, index)
      }).filter(ex => !!ex)
    },
    getPriceData(dataSet) {
      if (!dataSet) return []
      const data = dataSet[this.timeKeyOption.seconds]
      if (data.length === 0) return []
      return data.map(i => [i[0] * 1000, i[4]])
    },
    getOffsetData(quotes) {
      return quotes.map((quote) => {
        const ref = this.referencePriceData.find(r => r[0] === quote[0])
        return [quote[0], ref ? ((quote[1] / ref[1]) - 1) * 100 : null]
      })
    },
    updateChart() {
      // Add price series
      this.cryptowatchPriceSeries.forEach((item) => {
        this.chartOptions.series.push(item)
      })
      this.quotesPriceSeries.forEach(({ buy, sell }) => {
        this.chartOptions.series.push(buy)
        this.chartOptions.series.push(sell)
      })
      // Add offset series
      this.cryptowatchOffsetSeries.forEach((item) => {
        this.chartOptions.series.push(item)
      })
      this.quotesOffsetSeries.forEach(({ buy, sell }) => {
        this.chartOptions.series.push(buy)
        this.chartOptions.series.push(sell)
      })
      this.chartOptions.rangeSelector.selected = this.timeKeyOption.range
    },
    updateMarketRotation() {
      if (this.rotateMarket) {
        this.rotateMarketIntervalId = setInterval(() => {
          const { marketOptions } = this.$store.state
          let index = marketOptions.findIndex(x => x.name === this.marketOption.name) + 1
          if (index === marketOptions.length) index = 0
          this.marketOption = this.$store.state.marketOptions[index]
        }, this.rotateMarketInterval.seconds * 1000)
      } else {
        clearInterval(this.rotateMarketIntervalId)
      }
    },
    reload() {
      this.$router.replace({ path: this.$route.path, query: this.query })
    },
  },
}
</script>

<style scoped>
.min-width-150 {
  min-width: 150px;
}
.toggle {
  padding-right: 8px;
  padding-top: 4px;
  width: 100%;
}
.icon {
  height: 16px;
  filter: invert(0.8);
  padding: 6px;
}
</style>
