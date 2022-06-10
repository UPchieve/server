<template>
  <div class="stepper">
    <div
      class="step"
      v-for="(numStep, index) of totalSteps"
      :key="`step-${index}`"
      :class="numStep == totalSteps && 'step--last-step'"
    >
      <div class="circle-container">
        <div
          class="circle"
          :class="{
            'circle--complete': index + 1 < currentStep,
            'circle--not-started': numStep > currentStep,
          }"
        >
          <check-mark class="check-mark" v-if="currentStep > index + 1" />
          <span
            v-else
            class="step-display"
            :class="numStep > currentStep && 'step-display--not-started'"
            >{{ numStep }}</span
          >
        </div>
      </div>
      <div
        v-if="numStep < totalSteps"
        class="progress-bar"
        :class="numStep < currentStep && 'progress-bar--complete'"
      />
    </div>
  </div>
</template>

<script>
import CheckMark from '@/assets/check.svg'

export default {
  name: 'Stepper',
  components: {
    CheckMark,
  },
  props: {
    totalSteps: { type: Number, required: true },
    currentStep: { type: Number, required: true },
  },
}
</script>

<style lang="scss" scoped>
.stepper {
  @include flex-container(row, space-between, center);
}

.step {
  @include flex-container(row, initial, center);
  flex-grow: 1;

  &--last-step {
    flex-shrink: 1;
    flex-grow: 0;
  }

  &-display {
    width: 50%;
    cursor: default;
    color: $c-success-green;
    font-weight: 500;

    &--not-started {
      color: $border-grey;
    }
  }
}

.circle-container {
  @include flex-container(row, space-between);
}

.circle {
  @include flex-container(row, center, center);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  text-align: center;
  background-color: $selected-green;
  color: $upchieve-white;
  border: 2px solid $c-success-green;

  &--complete {
    background-color: $c-success-green;
  }

  &--not-started {
    border-color: $border-grey;
    background-color: $upchieve-white;
    color: $border-grey;
  }
}

.check-mark {
  width: 50%;

  & path {
    fill: $upchieve-white;
  }
}

.progress-bar {
  height: 2px;
  background-color: $border-grey;
  flex-grow: 1;

  &--complete {
    background-color: $c-success-green;
  }
}
</style>
