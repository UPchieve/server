<template>
  <div>
    <div class='survey-rate-container round-container' @click="handleRateClick" :class="{'selected-container': isSelected}">
      <div class='round-text' :class="{'selected-text': isSelected}">
        {{ rating }}
      </div>
    </div>
    <div class="survey-rate-label" v-if="label">
      {{ label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'SurveyRateNumber',
  props: {
    rating: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    responseId: {
      type: [String, Number],
      required: true,
    },
    questionId: {
      type: [String, Number],
      required: true
    },
    label: {
      type: String,
      default: '',
      required: false
    }
  },
  methods: {
    handleRateClick() {
      this.$emit('survey-rate-click', this.questionId, this.responseId)
    },
  },

  computed: {
  }
}
</script>
<style lang='scss' scoped>
  .round-container {
    border: solid 1px $c-border-grey;
    justify-content: center;
    align-items: center;
    align-self: flex-start;
    border-radius: 100%;
    padding: 0 0;
    margin: 20px 20px;
    height: 60px;
    width: 60px;
    display: inherit;
  }
  .round-text {
    font-size: 18pt;
    color: $c-secondary-grey;
    text-align: center;
    margin-top: 10px;
    cursor: pointer;
  }
  .selected-container {
    border-color: $c-success-green;
    background-color: $selected-green;
  }
  .selected-text {
    color: $c-success-green
  }

  .disabled-container {
    background-color: $c-background-grey;
  }

  .survey-rate-label {
    margin-top: -10px;
    text-align: center;
  }

</style>
