<template>
  <div>
    <input
      @input="onInput"
      type="radio"
      tabindex="-1"
      :id="id"
      :value="radioValue"
      :name="name"
      :checked="checked"
    />

    <label :for="id" tabindex="0" @keydown.space="keyDownFocus">
      <span>{{ label }}</span>

      <input
        v-if="showOpenResponse"
        type="text"
        tabindex="-1"
        @input="onOpenResponse"
        :disabled="isOpenResponseDisabled"
        :value="openResponseValue"
      />
    </label>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    radioValue: {
      types: [String, Number],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      required: true,
    },
    keyDownFocus: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    showOpenResponse: {
      type: Boolean,
      required: false,
      default: false,
    },
    isOpenResponseDisabled: {
      type: Boolean,
      default: true,
      required: false,
    },
    openResponseValue: {
      type: String,
      default: '',
    },
  },

  methods: {
    onInput(event) {
      this.$emit('radio-checked', event)
    },
    onOpenResponse(event) {
      this.$emit('open-response-input', event)
    },
  },
}
</script>

<style lang="scss" scoped>
label {
  @include flex-container(row, flex-start, center);
  @include font-category('helper-text');
  font-weight: 400;

  &:before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    padding: 3px;
    background-clip: content-box;
    border: 1px solid $border-grey;
    border-radius: 50%;
    margin-right: 0.5em;
  }
}

input[type='radio'] {
  display: none;

  &:checked + label:before {
    border: 6px solid $c-success-green;
  }
}

input[type='text'] {
  margin: 0 0 0 0.6em;
  width: 250px;
}
</style>
