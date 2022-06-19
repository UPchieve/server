<template>
  <div class="feedback-thank-you-modal">
    <div class="feedback-thank-you-modal__image">
      <UPdog />
    </div>
    <div class="feedback-thank-you-modal__container">
      <h1>Thank you for your feedback!</h1>
      <p class="feedback-thank-you-modal__content">
        Your feedback is very important to us. Without it we wouldn’t know how to improve your experience.
      </p>
    </div>
    <large-button v-if="mobileMode" primary="true" showArrow @click.native="onAccept">{{
      modalData.acceptText
    }}</large-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LargeButton from '@/components/LargeButton'
import UPdog from '@/assets/UPdog.svg'

export default {
  name: 'FeedbackThankYouModal',
  components: { UPdog, LargeButton },
  props: {
    modalData: { type: Object, required: true }
  },
  computed: {
    ...mapGetters({
      mobileMode: 'app/mobileMode'
    })
  },
  methods: {
    onAccept() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss">
.feedback-thank-you-modal {
  @include flex-container(column);

  &__container {
    @include flex-container(column);
    @include child-spacing(top, 24px);
    @include breakpoint-below('medium') {
      @include child-spacing(top, 16px);
    }
  }

  h1 {
    @include font-category('display-small');
  }

  &__content {
    @include font-category('body');
  }
}
</style>
