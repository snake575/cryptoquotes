/* eslint-disable no-shadow, no-param-reassign, object-curly-newline */
import { endOfDay, getTime } from 'date-fns'

class Market {
  constructor(name, label, markets) {
    this.name = name
    this.label = label
    this.markets = markets
  }
}

class RefMarket extends Market {
  constructor(name, label, markets) {
    super(name, label, markets)
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
    return data[data.length - 1][4]
  }
}

class QuotesMarket extends Market {
  constructor(name, label, markets) {
    super(name, label, markets)
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

export const state = () => ({
  quotesMarkets: [
    new QuotesMarket('surbtc', 'Buda', ['btcclp', 'ethclp', 'bchclp', 'ethbtc', 'bchbtc']),
    new QuotesMarket('cryptomkt', 'CryptoMKT', ['ethclp']),
  ],
  refMarkets: [
    new RefMarket('bitfinex', 'Bitfinex', ['btcusd', 'ethusd', 'bchusd', 'ethbtc', 'bchbtc']),
    new RefMarket('kraken', 'Kraken', ['btcusd', 'ethusd', 'bchusd', 'ethbtc', 'bchbtc']),
    new RefMarket('poloniex', 'Poloniex', ['btcusdt', 'ethusdt', 'bchusdt', 'ethbtc', 'bchbtc']),
  ],
  prices: [
    new Price('usdclp', 'USDCLP'),
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
  getRefMarket: state => exchange => (
    state.refMarkets.find(x => x.name === exchange)
  ),
  getQuotesMarket: state => exchange => (
    state.quotesMarkets.find(x => x.name === exchange)
  ),
  getRefMarketData: (state, getters) => (exchange, market) => (
    getters.getRefMarket(exchange).getData(market)
  ),
  getQuotesMarketData: (state, getters) => (exchange, market) => (
    getters.getQuotesMarket(exchange).getData(market)
  ),
  getRefMarketPrice: (state, getters) => (exchange, market) => (
    getters.getRefMarket(exchange).getPrice(market)
  ),
  getQuotesMarketPrice: (state, getters) => (exchange, market, side) => (
    getters.getQuotesMarket(exchange).getPrice(market, side)
  ),
  getPrice: state => market => (
    state.prices.find(x => x.name === market)
  ),
}

export const mutations = {
  updatePrice(state, { market, data }) {
    state.prices.find(x => x.name === market).set(data)
  },
  updateRefMarketData(state, { exchange, market, data }) {
    state.refMarkets.find(x => x.name === exchange).setData(market, data)
  },
  updateQuotesMarketData(state, { exchange, market, data }) {
    state.quotesMarkets.find(x => x.name === exchange).setData(market, data)
  },
}

export const actions = {
  async fetchPrice({ commit }, { exchange, market }) {
    const priceData = getters.getPrice(exchange, market)
    if (priceData.price && priceData.expire < Date.now()) return
    const data = await this.$axios.$get(`price/markets/${exchange}/${market}/1d`)
    commit('updatePrice', { exchange, market, data })
  },
  async fetchRefMarketData({ getters, commit }, { exchange, market, convert }) {
    const dataSet = getters.getRefMarketData(exchange, market)
    if (dataSet.data && dataSet.expire < Date.now()) return
    const { result: data } = await this.$axios.$get(`cryptowatch/markets/${exchange}/${market}/ohlc`, {
      params: { convert },
    })
    commit('updateRefMarketData', { exchange, market, data })
  },
  async fetchQuotesMarketData({ getters, commit }, { exchange, market }) {
    const dataSet = getters.getQuotesMarketData(exchange, market)
    if (dataSet.buy && dataSet.sell && dataSet.expire < Date.now()) return
    const [buy, sell] = await Promise.all([
      this.$axios.$get(`quotes/markets/${exchange}/${market}/buy/ohlc`),
      this.$axios.$get(`quotes/markets/${exchange}/${market}/sell/ohlc`),
    ])
    commit('updateQuotesMarketData', { exchange, market, data: { buy, sell } })
  },
}
