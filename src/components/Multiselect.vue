<template lang="pug">
.pl3
  .flex
    .pt2.label.white-40.f8 {{ label }} {{ ref }}
    .flex-auto.tr(v-if='hasClose' @click='close')
      img.icon(:src='closeIcon')
  .dt
    .pr2.pb1.dtc.v-mid(v-if='color')
      span.dot(:style="{ 'background-color': color }")
    v-multiselect(
      v-model='lazyValue'
      :options='options'
      :placeholder='placeholder'
      :label='labelBy'
      :trackBy='trackBy'
      :searchable='false'
      :show-labels='false'
      :allow-empty='false'
      @input='input'
    )
</template>

<script>
import closeIcon from '~/assets/close.svg'

export default {
  props: [
    'value',
    'index',
    'options',
    'label',
    'placeholder',
    'labelBy',
    'trackBy',
    'hasClose',
  ],
  data() {
    return { lazyValue: this.value, closeIcon }
  },
  computed: {
    ref() {
      return this.index === 0 ? '(Ref.)' : null
    },
    color() {
      if (!this.value) return null
      const { color } = this.value
      return Array.isArray(color) ? color[0] : color
    },
  },
  methods: {
    input() {
      this.$emit('input', this.lazyValue)
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
.icon {
  height: 12px;
  padding: 8px 15px 0 16px;
  margin-bottom: -2px;
}
.icon:hover {
  filter: invert(0.9);
}
.dot {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  display: inline-block;
}
</style>
