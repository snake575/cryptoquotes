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
        template(v-for='(exchange, index) in referenceExchanges')
          .dib.pr2.white-40
            | {{ exchange.label }}
            | {{ marketOption.currencies[1] | upper }}({{ marketOption.convert | upper }})
          .dib(:class="[ index > 0 ? 'pr1' : 'pr3' ]") {{ referencePrices[index] | number }}
          .dib.white-40.pr3(v-if='index > 0') {{ referencePriceOffsets[index] | percent }}
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
      ex = [store.state.referenceExchanges[0].name],
      m = marketOption.name,
      tk = timeKeyOption.label,
      r = rotateMarket,
      i = rotateMarketInterval.label,
    } = query
    // Set exchanges from query
    let {
      referenceExchanges,
      quotesExchanges,
    } = store.state
    referenceExchanges = referenceExchanges.filter(e => ex.includes(e.name))
    quotesExchanges = quotesExchanges.filter(e => ex.includes(e.name))
    const allExchanges = [...referenceExchanges, ...quotesExchanges]
    const exchangesList = [...new Set(ex)]
    const exchanges = exchangesList.map(e1 => allExchanges.find(e2 => e2.name === e1))

    // Set options from query string
    marketOption = store.getters.getMarketOption(m)
    timeKeyOption = store.getters.getTimeKeyOption(tk)
    rotateMarket = JSON.parse(r)
    rotateMarketInterval = store.getters.getIntervalOption(i)
    // Fetch market data
    await Promise.all([
      ...referenceExchanges.map(exchange => (
        store.dispatch('fetchReferenceExchangeData', {
          exchange: exchange.name,
          market: marketOption.markets[0],
          convert: marketOption.convert,
        })
      )),
      ...quotesExchanges.map(exchange => (
        store.dispatch('fetchQuotesExchangeData', {
          exchange: exchange.name,
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
      exchanges,
      exchangesList,
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
        options: [...referenceExchanges, ...quotesExchanges],
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
        c: this.marketOption.convert,
        m: this.marketOption.name,
        tk: this.timeKeyOption.label,
        r: this.rotateMarket,
        i: this.rotateMarketInterval.label,
        ex: this.exchangesList,
      }
    },
    referenceMarket() {
      return this.marketOption.markets[0]
    },
    quotesMarket() {
      return this.marketOption.markets[1]
    },
    referenceExchanges() {
      return this.filterExchanges(this.$store.state.referenceExchanges)
    },
    quotesExchanges() {
      return this.filterExchanges(this.$store.state.quotesExchanges)
    },
    referenceExchange() {
      return this.exchanges[0]
    },
    referencePriceSeries() {
      return this.filterExchangeList(this.referenceExchanges, (ex) => {
        const { data } = this.$store.getters.getReferenceExchangeData(ex.name, this.referenceMarket)
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
        const { buy, sell } = this.$store.getters.getQuotesExchangeData(ex.name, this.quotesMarket)
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
    referencePriceData() {
      const { data } = this.referenceExchange.getData(this.referenceMarket)
      return this.getPriceData(data)
    },
    referencePrices() {
      return this.filterExchangeList(this.referenceExchanges, ex => (
        this.$store.getters.getReferenceExchangePrice(ex.name, this.referenceMarket)
      ))
    },
    quotesPrices() {
      return this.filterExchangeList(this.quotesExchanges, ex => ({
        buy: this.$store.getters.getQuotesExchangePrice(ex.name, this.quotesMarket, 'buy'),
        sell: this.$store.getters.getQuotesExchangePrice(ex.name, this.quotesMarket, 'sell'),
      }))
    },
    referencePrice() {
      return this.referenceExchange.getPrice(this.referenceMarket)
    },
    referenceOffsetSeries() {
      return this.referencePriceSeries.map(item => ({
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
    referencePriceOffsets() {
      return this.referencePrices.map(price => (
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
      this.referencePriceSeries.forEach((item) => {
        this.chartOptions.series.push(item)
      })
      this.quotesPriceSeries.forEach(({ buy, sell }) => {
        this.chartOptions.series.push(buy)
        this.chartOptions.series.push(sell)
      })
      // Add offset series
      this.referenceOffsetSeries.forEach((item) => {
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
