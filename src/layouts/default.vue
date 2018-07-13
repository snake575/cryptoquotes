<template lang="pug">
main.flex.flex-column.min-vh-100.bg-black.white-80.droid-sans-mono.f8
  header.bb.b--white-30
    .dib.br.b--white-20.pv.ph3.f7 CryptoQuotes
    template(v-for='(price, key) in prices')
      .dib.pv.pl3.pr2.white-40 {{ key }}
      .dib.pv.b--white-20.br.pr3 {{ price }}
  nuxt.flex-auto(:nuxtChildKey='$route.fullPath')
  footer.bt.b--white-30
    .ph3.pv2.dib.br.b--white-20 Data {{ date }}
</template>

<script>
export default {
  data() {
    return {
      date: new Date().toUTCString(),
    }
  },
  computed: {
    prices() {
      return {
        USDCLP: this.$store.getters.getPrice('usdclp').price,
      }
    },
  },
}
</script>


<style>
.droid-sans-mono {
  font-family: 'droid-sans-mono'
}
.f8 {
  font-size: 11px;
}
.pv {
  padding-top: 14px;
  padding-bottom: 14px;
}
</style>
