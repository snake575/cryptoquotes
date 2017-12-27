<template lang="pug">
main.flex.flex-column.min-vh-100.bg-black.white-80.droid-sans-mono.f8
  header.bb.b--white-30
    .dib.br.b--white-20.pv.ph3.f7 CryptoQuotes
    .dib.br.b--white-20.pv.ph3
      .dib.pr2.white-40 USDCLP
      .dib {{ price }}
  nuxt.flex-auto(:nuxtChildKey='$route.fullPath')
  footer.bt.b--white-30
    .ph3.pv2.dib.br.b--white-20 {{ date }}
</template>

<script>
export default {
  data() {
    return {
      date: new Date().toUTCString(),
    }
  },
  computed: {
    price() {
      return this.$store.getters.getPrice('usdclp').price
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
