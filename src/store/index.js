/* eslint-disable no-shadow, no-param-reassign, object-curly-newline */
import { endOfDay, getTime } from 'date-fns'

class Exchange {
  constructor(name, label, color, markets) {
    this.name = name
    this.label = label
    this.color = color
    this.markets = markets
    this.source = null
  }
}

class CryptowatchExchange extends Exchange {
  constructor(name, label, color, markets) {
    super(name, label, color, markets)
    this.source = 'cryptowatch'
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
    this.source = 'quotes'
    this.dataSets = markets.map(m => (
      { market: m, buy: null, sell: null, expire: null }
    ))
  }

  getData(market) {
    const data = this.dataSets.find(x => x.market === market)
    if (!data) return this.dataSets[0]
    return data
  }

  setData(market, { buy, sell }) {
    const dataSet = this.getData(market)
    dataSet.buy = buy
    dataSet.sell = sell
    dataSet.expire = Date.now() + 300
  }

  getPrice(market, side) {
    let data = this.getData(market)
    if (!data || !data[side]) return null
    data = data[side]['300']
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
    ['btcclp', 'bchclp', 'bchbtc', 'ethclp', 'ethbtc', 'ltcclp', 'ltcbtc'],
  ),
  new QuotesExchange(
    'cryptomkt', 'CryptoMKT', ['#FF3D00', '#FF6E40'],
    ['btcclp', 'ethclp'],
  ),
]

const cryptowatchExchanges = [
  new CryptowatchExchange(
    'bitfinex', 'Bitfinex', '#C6FF00',
    ['btcusd', 'bchusd', 'bchbtc', 'ethusd', 'ethbtc', 'ltcusd', 'ltcbtc'],
  ),
  new CryptowatchExchange(
    'bitstamp', 'Bitstamp', '#00E676',
    ['btcusd', 'bchusd', 'bchbtc', 'ethusd', 'ethbtc', 'ltcusd', 'ltcbtc'],
  ),
  new CryptowatchExchange(
    'kraken', 'Kraken', '#651FFF',
    ['btcusd', 'bchusd', 'bchbtc', 'ethusd', 'ethbtc', 'ltcusd', 'ltcbtc'],
  ),
  new CryptowatchExchange(
    'poloniex', 'Poloniex', '#1DE9B6',
    ['btcusdt', 'bchusdt', 'bchbtc', 'ethusdt', 'ethbtc', 'ltcusdt', 'ltcbtc'],
  ),
]

const prices = [
  new Price('usdclp', 'USDCLP'),
]

export const state = () => ({
  quotesExchanges,
  cryptowatchExchanges,
  prices,
  exchangeOptions: [
    ...cryptowatchExchanges,
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
    label: 'LTCUSD(CLP)',
    name: 'ltcusdclp',
    markets: ['ltcusd', 'ltcclp'],
    currencies: ['ltc', 'usd'],
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
    label: 'LTCBTC',
    name: 'ltcbtc',
    markets: ['ltcbtc', 'ltcbtc'],
    currencies: ['ltc', 'btc'],
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
    [...state.cryptowatchExchanges, ...state.quotesExchanges]
  ),
  getCryptowatchExchange: state => exchange => (
    state.cryptowatchExchanges.find(x => x.name === exchange)
  ),
  getQuotesExchange: state => exchange => (
    state.quotesExchanges.find(x => x.name === exchange)
  ),
  getCryptowatchExchangeData: (state, getters) => (exchange, market) => (
    getters.getCryptowatchExchange(exchange).getData(market)
  ),
  getQuotesExchangeData: (state, getters) => (exchange, market) => (
    getters.getQuotesExchange(exchange).getData(market)
  ),
  getCryptowatchExchangePrice: (state, getters) => (exchange, market) => (
    getters.getCryptowatchExchange(exchange).getPrice(market)
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
    const allExchanges = [...state.cryptowatchExchanges, ...state.quotesExchanges]
    state.exchangeOptions = allExchanges.filter(e => e.markets.some(m => markets.includes(m)))
  },
  updatePrice(state, { market, data }) {
    state.prices.find(x => x.name === market).set(data)
  },
  updateCryptowatchExchangeData(state, { exchange, market, data }) {
    state.cryptowatchExchanges.find(x => x.name === exchange).setData(market, data)
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
  async fetchCryptowatchExchangeData({ getters, commit }, { exchange, market, convert }) {
    const dataSet = getters.getCryptowatchExchangeData(exchange, market)
    if (dataSet.data && dataSet.expire < Date.now()) return
    const { result: data } = await this.$axios.$get(`cryptowatch/markets/${exchange}/${market}/ohlc`, {
      params: { convert },
    })
    commit('updateCryptowatchExchangeData', { exchange, market, data })
  },
  async fetchQuotesExchangeData({ getters, commit }, { exchange, market }) {
    const dataSet = getters.getQuotesExchangeData(exchange, market)
    if (!dataSet || (dataSet.buy && dataSet.sell && dataSet.expire < Date.now())) return
    const [buy, sell] = await Promise.all([
      this.$axios.$get(`quotes/markets/${exchange}/${market}/buy/ohlc`),
      this.$axios.$get(`quotes/markets/${exchange}/${market}/sell/ohlc`),
    ])
    commit('updateQuotesExchangeData', { exchange, market, data: { buy, sell } })
  },
}
