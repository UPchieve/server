<template>
  <cell type="cell" :class="classes" @click="onClick" :style="style">
    {{ content }}
  </cell>
</template>

<script>
import './cell.css'

export default {
  name: 'cell',

  props: {
    content: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classes() {
      return {
        'storybook-cell': true,
        'storybook-cell--selected': this.selected,
        'storybook-cell--unselected': !this.selected
      }
    }
  },

  methods: {
    onClick() {
      this.$emit('onClick')
    }
  }
}
</script>
