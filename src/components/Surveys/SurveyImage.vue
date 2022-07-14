<template>
  <div class="survey-image__container">
    <img
      :src="src"
      @mouseover="onMouseOverImage"
      @mouseleave="onMouseLeaveImage"
      @click="onImageClick"
      class="survey-image__image"
      :class="{
        'survey-image__image--not-selected':
          isImageGreyedOut,
      }"
    />
    <!-- TODO figure out better naming for isLabelSHowing and not as confusing -->
    <div
      class="survey-image__display"
      :class="{
        'survey-image__display--show': isLabelShowing
      }"
    >
      {{ label }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: '',
      required: false
    },
    isImageGreyedOut: {
      type: Boolean,
      required: true,
    },
    isLabelShowing: {
      type: Boolean,
      required: true,
    },
  },

  methods: {
    onMouseOverImage(event) {
      this.$emit('mouse-over-image', event)
    },
    onMouseLeaveImage(event) {
      this.$emit('mouse-leave-image', event)
    },
    onImageClick(event) {
      this.$emit('survey-image-click', event)
    },
  },
}
</script>

<style lang="scss" scoped>
.survey-image {
  &__container {
    @include flex-container(column, center, center);
  }


  &__image {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      filter: grayscale(0);
      transform: scale(1.2);
    }

    &:active {
      filter: grayscale(0);
      transform: scale(0.9);
    }

    &--not-selected {
      filter: grayscale(1);
    }
  }

  &__display {
    margin: 1em 0;
    text-align: center;
    visibility: hidden;

    &--show {
      visibility: initial;
    }
  }
}
</style>
