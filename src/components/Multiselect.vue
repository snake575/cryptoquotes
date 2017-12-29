<template lang="pug">
.pl3
  .pt2.label.white-40.f8 {{ label }}
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
export default {
  props: ['value', 'options', 'label', 'placeholder', 'labelBy', 'trackBy'],
  data() {
    return { lazyValue: this.value }
  },
  methods: {
    input() {
      this.$emit('input', this.lazyValue)
    },
  },
}
</script>
