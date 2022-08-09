<template>
  <div>
    <input
      @input="handleCheckboxSelection"
      type="checkbox"
      tabindex="-1"
      :id="id"
      :value="checkboxValue"
      :name="name"
      :checked="checked"
    />

    <label :for="id" tabindex="0">
      <span>{{ label }}</span>
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
    checkboxValue: {
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
    label: {
      type: String,
      required: true,
    },
    questionId: {
      type: [String, Number],
      required: true
    },
    responseId: {
      type: [String, Number],
      required: true,
    },
  },

  methods: {
    handleCheckboxSelection() {
      this.$emit('survey-checkbox-input', this.questionId, this.responseId, '')
    }
  }
}
</script>

<style lang="scss" scoped>
label {
  font-weight: 400;
  margin-top: 5px;
}

input[type='checkbox'] {
  margin: 10px;
  border: 1px solid $border-grey;

  &:checked + label:before {
    border: 6px solid $c-success-green;
  }
}
</style>
