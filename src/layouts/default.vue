<template lang="pug">
main.flex.flex-column.min-vh-100.bg-black.white-80.droid-sans-mono.f8
  header.bb.b--white-30
    .dib.br.b--white-20.pv.ph3.f7 CryptoQuotes
    template(v-for='(price, key) in prices')
      .dib.pv.pl3.pr2.white-40 {{ key }}
      .dib.pv.b--white-20.br.pr3 {{ price }}
    v-popover.fr(offset='16')
      .dib.bl.b--white-20.pv.ph3 Donations {{ btcAddress }}
      template(slot='popover')
        .bg-black.pa3.white-80.droid-sans-mono.f6
          qriously.pb3(
            :value='btcDonation'
            background='black'
            foreground='white'
            size=150)
          a.link.dim.ba.ph3.pv2.dib.white-80(
            :href='btcDonation'
            ) Open on wallet
  nuxt.flex-auto(:nuxtChildKey='$route.fullPath')
  footer.bt.b--white-30
    .ph3.pv2.dib.br.b--white-20 Data {{ date }}
</template>

<script>
import bip21 from 'bip21'

const btcAddress = '17fqck2bjcX84LRvhtC56ai2fE4ywrd3JN'

export default {
  data() {
    return {
      date: new Date().toUTCString(),
      // Donations
      btcAddress,
      btcDonation: bip21.encode(btcAddress, {
        amount: 0.002,
        label: 'Donation for CryptoQuotes',
      }),
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
  font-family: 'droid-sans-mono';
}
.f8 {
  font-size: 11px;
}
.pv {
  padding-top: 14px;
  padding-bottom: 14px;
}
</style>
