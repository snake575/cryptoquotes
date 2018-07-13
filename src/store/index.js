/* eslint-disable no-shadow, no-param-reassign, object-curly-newline */
import { endOfDay, getTime } from 'date-fns'

class Exchange {
  constructor(name, label, color, markets) {
    this.name = name
    this.label = label
    this.color = color
    this.markets = markets
  }
}

class ReferenceExchange extends Exchange {
  constructor(name, label, color, markets) {
    super(name, label, color, markets)
    this.dataSets = markets.map(m => (
      { market: m, data: null, expire: null }
    ))
  }

  getData(market) {
    return this.dataSets.find(x => x.market === market)
  }

  setData(market, data) {
    const dataSet = this.getData(market)
    dataSet.data = data
    dataSet.expire = Date.now() + 300
  }

  getPrice(market) {
    let { data } = this.getData(market)
    if (!data) return null
    data = data['60']
    if (data.length === 0) return null
    return data[data.length - 1][4]
  }
}

class QuotesExchange extends Exchange {
  constructor(name, label, color, markets) {
    super(name, label, color, markets)
    this.dataSets = markets.map(m => (
      { market: m, buy: null, sell: null, expire: null }
    ))
  }

  getData(market) {
    return this.dataSets.find(x => x.market === market)
  }

  setData(market, { buy, sell }) {
    const dataSet = this.getData(market)
    dataSet.buy = buy
    dataSet.sell = sell
    dataSet.expire = Date.now() + 300
  }

  getPrice(market, side) {
    let data = this.getData(market)[side]
    if (!data) return null
    data = data['300']
    if (data.length === 0) return null
    return data[data.length - 1][4]
  }
}

class Price {
  constructor(name, label) {
    this.name = name
    this.label = label
    this.price = null
    this.timestamp = null
    this.expire = null
  }

  set({ price, timestamp }) {
    this.price = price
    this.timestamp = timestamp
    this.expire = getTime(endOfDay(new Date()))
  }
}

const quotesExchanges = [
  new QuotesExchange(
    'surbtc', 'Buda', ['#00B0FF', '#40C4FF'],
    ['btcclp', 'ethclp', 'bchclp', 'ethbtc', 'bchbtc'],
  ),
  new QuotesExchange(
    'cryptomkt', 'CryptoMKT', ['#3D5AFE', '#536DFE'],
    ['btcclp', 'ethclp'],
  ),
]

const referenceExchanges = [
  new ReferenceExchange(
    'bitfinex', 'Bitfinex', '#C6FF00',
    ['btcusd', 'ethusd', 'bchusd', 'ethbtc', 'bchbtc'],
  ),
  new ReferenceExchange(
    'bitstamp', 'Bitstamp', '#00E676',
    ['btcusd', 'ethusd', 'bchusd', 'ethbtc', 'bchbtc'],
  ),
  new ReferenceExchange(
    'kraken', 'Kraken', '#651FFF',
    ['btcusd', 'ethusd', 'bchusd', 'ethbtc', 'bchbtc'],
  ),
  new ReferenceExchange(
    'poloniex', 'Poloniex', '#1DE9B6',
    ['btcusdt', 'ethusdt', 'bchusdt', 'ethbtc', 'bchbtc'],
  ),
]

const prices = [
  new Price('usdclp', 'USDCLP'),
]

export const state = () => ({
  quotesExchanges,
  referenceExchanges,
  prices,
  exchangeOptions: [
    ...referenceExchanges,
    ...quotesExchanges,
  ],
  marketOptions: [{
    label: 'BTCUSD(CLP)',
    name: 'btcusdclp',
    markets: ['btcusd', 'btcclp'],
    currencies: ['btc', 'usd'],
    convert: 'clp',
  }, {
    label: 'ETHUSD(CLP)',
    name: 'ethusdclp',
    markets: ['ethusd', 'ethclp'],
    currencies: ['eth', 'usd'],
    convert: 'clp',
  }, {
    label: 'BCHUSD(CLP)',
    name: 'bchusdclp',
    markets: ['bchusd', 'bchclp'],
    currencies: ['bch', 'usd'],
    convert: 'clp',
  }, {
    label: 'ETHBTC',
    name: 'ethbtc',
    markets: ['ethbtc', 'ethbtc'],
    currencies: ['eth', 'btc'],
  }, {
    label: 'BCHBTC',
    name: 'bchbtc',
    markets: ['bchbtc', 'bchbtc'],
    currencies: ['bch', 'btc'],
  }],
  timeKeyOptions: [
    { label: '5M', seconds: '300', range: 0 },
    { label: '15M', seconds: '900', range: 1 },
    { label: '1H', seconds: '3600', range: 2 },
    { label: '6H', seconds: '21600', range: 3 },
    { label: '12H', seconds: '43200', range: 4 },
    { label: '1D', seconds: '86400', range: 5 },
  ],
  intervalOptions: [
    { label: '10S', seconds: 10 },
    { label: '30S', seconds: 30 },
    { label: '1M', seconds: 60 },
    { label: '5M', seconds: 300 },
  ],
})

export const getters = {
  getMarketOption: state => market => (
    state.marketOptions.find(x => x.name === market)
  ),
  getTimeKeyOption: state => label => (
    state.timeKeyOptions.find(x => x.label === label)
  ),
  getIntervalOption: state => label => (
    state.intervalOptions.find(x => x.label === label)
  ),
  getAllExchanges: state => () => (
    [...state.referenceExchanges, ...state.quotesExchanges]
  ),
  getReferenceExchange: state => exchange => (
    state.referenceExchanges.find(x => x.name === exchange)
  ),
  getQuotesExchange: state => exchange => (
    state.quotesExchanges.find(x => x.name === exchange)
  ),
  getReferenceExchangeData: (state, getters) => (exchange, market) => (
    getters.getReferenceExchange(exchange).getData(market)
  ),
  getQuotesExchangeData: (state, getters) => (exchange, market) => (
    getters.getQuotesExchange(exchange).getData(market)
  ),
  getReferenceExchangePrice: (state, getters) => (exchange, market) => (
    getters.getReferenceExchange(exchange).getPrice(market)
  ),
  getQuotesExchangePrice: (state, getters) => (exchange, market, side) => (
    getters.getQuotesExchange(exchange).getPrice(market, side)
  ),
  getPrice: state => market => (
    state.prices.find(x => x.name === market)
  ),
}

export const mutations = {
  setExchangeOptions(state, markets) {
    const allExchanges = [...state.referenceExchanges, ...state.quotesExchanges]
    state.exchangeOptions = allExchanges.filter(e => e.markets.some(m => markets.includes(m)))
  },
  updatePrice(state, { market, data }) {
    state.prices.find(x => x.name === market).set(data)
  },
  updateReferenceExchangeData(state, { exchange, market, data }) {
    state.referenceExchanges.find(x => x.name === exchange).setData(market, data)
  },
  updateQuotesExchangeData(state, { exchange, market, data }) {
    state.quotesExchanges.find(x => x.name === exchange).setData(market, data)
  },
}

export const actions = {
  async fetchPrice({ commit }, { exchange, market }) {
    const priceData = getters.getPrice(exchange, market)
    if (priceData.price && priceData.expire < Date.now()) return
    const data = await this.$axios.$get(`price/markets/${exchange}/${market}/1d`)
    commit('updatePrice', { exchange, market, data })
  },
  async fetchReferenceExchangeData({ getters, commit }, { exchange, market, convert }) {
    const dataSet = getters.getReferenceExchangeData(exchange, market)
    if (dataSet.data && dataSet.expire < Date.now()) return
    const { result: data } = await this.$axios.$get(`cryptowatch/markets/${exchange}/${market}/ohlc`, {
      params: { convert },
    })
    commit('updateReferenceExchangeData', { exchange, market, data })
  },
  async fetchQuotesExchangeData({ getters, commit }, { exchange, market }) {
    const dataSet = getters.getQuotesExchangeData(exchange, market)
    if (dataSet.buy && dataSet.sell && dataSet.expire < Date.now()) return
    const [buy, sell] = await Promise.all([
      this.$axios.$get(`quotes/markets/${exchange}/${market}/buy/ohlc`),
      this.$axios.$get(`quotes/markets/${exchange}/${market}/sell/ohlc`),
    ])
    commit('updateQuotesExchangeData', { exchange, market, data: { buy, sell } })
  },
}
