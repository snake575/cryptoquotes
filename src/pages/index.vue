<template lang='pug'>
.flex.flex-column
  .flex.flex-wrap.items-center.b--white-20
    multiselect.dib.bb.br.b--white-20.min-width-150(
      v-model='marketOption'
      v-bind='marketProps'
    )
    multiselect.dib.bb.br.b--white-20.min-width-150(
      v-model='referenceExchangeOption'
      v-bind='referenceExchangeProps'
    )
    multiselect.dib.bb.br.b--white-20.min-width-150(
      v-model='quotesExchangeOption'
      v-bind='quotesExchangeProps'
    )
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
        .dib.pr3 {{ marketOption.currencies[0] | upper }}
        .dib.pr2.white-40
          | {{ referenceExchangeOption.label }}
          | {{ marketOption.currencies[1] | upper }}({{ marketOption.convert | upper }})
        .dib.pr3 {{ referenceExchangePrice | number }}
        .flex.items-center
          .dib.pr2.white-40 {{ quotesExchangeOption.label }} {{ marketOption.convert | upper }}
          .dib
            div
              .dib.pr2 {{ quotesBuyPrice | number }}
              .dib.white-40.pr2 {{ offsetBuyPrice | percent }}
              .dib.white-40 (Buy)
            .pt1
              .dib.pr2 {{ quotesSellPrice | number }}
              .dib.white-40.pr2 {{ offsetSellPrice | percent }}
              .dib.white-40 (Sell)
  .flex.flex-auto
    highstock.flex-auto.br.b--white-20(
      id='chart'
      :options='chartOptions'
    )
    //- .w-auto
    //-   .tc.pv2.ph3.bb.b--white-20 Ref Markets
    //-   .pa2.bb.b--white-20
    //-     .pb2.white-40 Bitfinex BTCUSD(CLP)
    //-     .flex.justify-between
    //-       div 16466
    //-       div 9000123
    //-   .tc.pv2.ph3.bb.b--white-20 Quote Markets
    //-   .pa2.bb.b--white-20
    //-     .pb2.white-40 SurBTC BTCCLP
    //-     .flex.justify-between
    //-       div 9000123
    //-       div 10000123
    //-   .pa2.bb.b--white-20
    //-     .pb2.white-40 SurBTC ETHCLP
    //-     .flex.justify-between
    //-       div 400123
    //-       div 500123
</template>

<script>
import Multiselect from '~/components/Multiselect'

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
    let referenceExchangeOption = store.state.referenceExchanges[0]
    let quotesExchangeOption = store.state.quotesExchanges[0]
    let marketOption = store.state.marketOptions[0]
    let timeKeyOption = store.state.timeKeyOptions[2]
    let rotateMarket = false
    let rotateMarketInterval = store.state.intervalOptions[0]
    // Query string options
    const {
      re = referenceExchangeOption.name,
      m = marketOption.name,
      qe = quotesExchangeOption.name,
      tk = timeKeyOption.label,
      r = rotateMarket,
      i = rotateMarketInterval.label,
    } = query
    // Set options from query string
    referenceExchangeOption = store.getters.getReferenceExchange(re)
    quotesExchangeOption = store.getters.getQuotesExchange(qe)
    marketOption = store.getters.getMarketOption(m)
    timeKeyOption = store.getters.getTimeKeyOption(tk)
    rotateMarket = JSON.parse(r)
    rotateMarketInterval = store.getters.getIntervalOption(i)
    // Fetch market data
    await Promise.all([
      store.dispatch('fetchReferenceExchangeData', {
        exchange: referenceExchangeOption.name,
        market: marketOption.markets[0],
        convert: marketOption.convert,
      }),
      store.dispatch('fetchQuotesExchangeData', {
        exchange: quotesExchangeOption.name,
        market: marketOption.markets[1],
      }),
      store.dispatch('fetchPrice', {
        exchange: 'oxr',
        market: 'usdclp',
      }),
    ])
    // Return data
    return {
      referenceExchangeOption,
      quotesExchangeOption,
      marketOption,
      timeKeyOption,
      rotateMarket,
      rotateMarketInterval,
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
      referenceExchanges,
      quotesExchanges,
      intervalOptions,
    } = this.$store.state
    return {
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
      // Reference market
      referenceExchangeProps: {
        label: 'Reference',
        labelBy: 'label',
        trackBy: 'name',
        placeholder: 'Select a market',
        options: referenceExchanges,
      },
      // Quotes market
      quotesExchangeProps: {
        label: 'Quotes',
        labelBy: 'label',
        trackBy: 'name',
        placeholder: 'Select a market',
        options: quotesExchanges,
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
        series: [{
          data: null,
          name: 'Reference',
          type: 'line',
          yAxis: 0,
          colorIndex: 0,
        }, {
          data: null,
          name: 'Quotes Buy',
          type: 'line',
          yAxis: 0,
          colorIndex: 3,
        }, {
          data: null,
          name: 'Quotes Sell',
          type: 'line',
          yAxis: 0,
          colorIndex: 2,
        }, {
          data: null,
          name: 'Offset Buy',
          type: 'line',
          yAxis: 1,
          colorIndex: 3,
          tooltip: {
            valueSuffix: '%',
          },
        }, {
          data: null,
          name: 'Offset Sell',
          type: 'line',
          yAxis: 1,
          colorIndex: 2,
          tooltip: {
            valueSuffix: '%',
          },
        }],
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
        re: this.referenceExchangeOption.name,
        rm: this.marketOption.markets[0],
        c: this.marketOption.convert,
        m: this.marketOption.name,
        qe: this.quotesExchangeOption.name,
        qm: this.marketOption.markets[1],
        tk: this.timeKeyOption.label,
        r: this.rotateMarket,
        i: this.rotateMarketInterval.label,
      }
    },
    referenceExchangeData() {
      const { data } = this.$store.getters.getReferenceExchangeData(this.query.re, this.query.rm)
      return this.getPriceData(data)
    },
    quotesBuyData() {
      const { buy } = this.$store.getters.getQuotesExchangeData(this.query.qe, this.query.qm)
      return this.getPriceData(buy)
    },
    quotesSellData() {
      const { sell } = this.$store.getters.getQuotesExchangeData(this.query.qe, this.query.qm)
      return this.getPriceData(sell)
    },
    referenceExchangePrice() {
      return this.$store.getters.getReferenceExchangePrice(this.query.re, this.query.rm)
    },
    quotesBuyPrice() {
      return this.$store.getters.getQuotesExchangePrice(this.query.qe, this.query.qm, 'buy')
    },
    quotesSellPrice() {
      return this.$store.getters.getQuotesExchangePrice(this.query.qe, this.query.qm, 'sell')
    },
    offsetBuyData() {
      return this.getOffsetData(this.quotesBuyData)
    },
    offsetSellData() {
      return this.getOffsetData(this.quotesSellData)
    },
    offsetBuyPrice() {
      return (this.quotesBuyPrice / this.referenceExchangePrice) - 1
    },
    offsetSellPrice() {
      return (this.quotesSellPrice / this.referenceExchangePrice) - 1
    },
    // referenceExchangesPrices() {
    //   return this.$store.state.referenceExchanges.map(ref => (
    //     {
    //       name: ref.name,
    //       markets: ref.markets.map(m => (
    //         { name: ref.name, price: this.$store.getters.getReferenceExchangePrice(ref.name, m) }
    //       )),
    //     }
    //   ))
    // },
  },
  watch: {
    referenceExchangeOption() {
      this.reload()
    },
    quotesExchangeOption() {
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
    getPriceData(dataSet) {
      if (!dataSet) return []
      const data = dataSet[this.timeKeyOption.seconds]
      return data.map(i => [i[0] * 1000, i[4]])
    },
    getOffsetData(quotes) {
      return quotes.map((quote) => {
        const ref = this.referenceExchangeData.find(r => r[0] === quote[0])
        return [quote[0], ref ? ((quote[1] / ref[1]) - 1) * 100 : null]
      })
    },
    updateChart() {
      this.chartOptions.series[0].data = this.referenceExchangeData
      this.chartOptions.series[1].data = this.quotesBuyData
      this.chartOptions.series[2].data = this.quotesSellData
      this.chartOptions.series[3].data = this.offsetBuyData
      this.chartOptions.series[4].data = this.offsetSellData
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
</style>
