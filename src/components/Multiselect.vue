<template lang="pug">
.pl3
  .pt2.label.white-40.f8 {{ label }}
  multiselect(
    v-model='lazyValue'
    :options='options'
    :placeholder='placeholder'
    :label='labelBy'
    :searchable='false'
    :show-labels='false'
    :allow-empty='false'
    @input='input'
  )
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  components: { Multiselect },
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

<style>
.multiselect {
  background-color: black;
  color: inherit;
  min-height: 24px;
}

.multiselect__tags {
  background-color: inherit;
  border: 0px;
  min-height: 24px;
  padding-left: 0px;
  padding-top: 0px;
}

.multiselect__single {
  margin-bottom: 0px;
  padding-left: 0px;
}

.multiselect__select {
  height: 18px;
  padding-left: 0px;
  padding-right: 0px;
}

.multiselect__input,
.multiselect__single {
  background-color: inherit;
}

.multiselect,
.multiselect__input,
.multiselect__single {
  font-size: inherit;
}

.multiselect__content-wrapper {
  background-color: inherit;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  border-color: rgba(255, 255, 255, 0.2);
}

.multiselect__option--disabled {
  background-color: inherit;
  color: rgba(255, 255, 255, 0.2);
}
</style>
