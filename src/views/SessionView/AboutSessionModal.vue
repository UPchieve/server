<template>
  <modal
  :closeModal="closeModal"
  class="about-session-modal-wrapper"
  >
    <div class="about-session-modal">
      <div class="header-info">
        <cross-icon class="cross-icon" @click="closeModal"/>
        <div class="header">About the session</div>
        <div v-if="!hasMoreThanTwoSessions" class="alert-container">
          <div class="alert">
            <alert-icon class="alert-icon"/>
            <div class="subheading">This is Jennifer's first session!</div>
          </div>  
          <div class="subtitle">Be sure to be welcoming and extra patient as they get used to our platform.</div>
        </div>
      </div>
      <div class="session-info">
        <div class="session-info-stepper-container">
          <stepper :totalSteps=3 class="session-info-stepper" />
          <div class="session-info-responses">
            <div 
            v-for="response in mockData"
            :key="response.title"
            >
              <div class="session-info-title"> {{ response.title}} </div>
              <div class="session-info-response"> {{ response.subtitle }} </div>
            </div>
          </div>
        </div>
        <div v-if="hasMoreThanTwoSessions && confidenceLow" class="tip">
          <div class="tip-title"> UPchieve's tip</div>
          <div class="tip-text"> Start the session off by checking in about what has got them feeling stressed.</div>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import Stepper from '@/components/Stepper'
import AlertIcon from '@/assets/blue-alert.svg'
import CrossIcon from '@/assets/cross.svg'

export default {
 name: 'about-session-modal',
 components: { Modal, Stepper, AlertIcon, CrossIcon },
  props: {
    closeModal: { type: Function, required: true },
    volunteerName: { type: String, required: true, default: '' }
  },
  data() {
    const mockData = [
      {
      title: 'Their goal:',
      subtitle: 'Solve a specific problem'
      },
      {
      title: 'Their level of understanding:',
      subtitle: 'They think they know how to do it, but need some help'
      },
      {
      title: 'Their confidence:',
      subtitle: 'They think they know how to do it, but need some help'
      },   
    ],
    hasMoreThanTwoSessions = true,
    confidenceLow = false

    return {
      mockData,
      hasMoreThanTwoSessions,
      confidenceLow
    }
  }
}
</script>

<style lang="scss">
.about-session-modal-wrapper .upc-modal-form {
  @include flex-container(column);
  border-radius: 22px;
  padding: 0;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.about-session-modal-wrapper .upc-modal-form--bottom-padding {
  padding: 0;
}

.about-session-modal .stepper, .step {
  flex-direction: column;
}

.about-session-modal .step {
  flex-direction: column;
}

.about-session-modal .step-display {
  color: #1855D166;
}

.about-session-modal .circle {
  border: 1px solid #1855D166;
}

.about-session-modal .progress-bar {
  background-color: #1855D166;
  height: 41px;
  width: 1px;
}
</style>

<style lang="scss" scoped>
.about-session-modal {
  text-align: left;
}

.header-info {
  padding: 2rem 2rem 2rem 3.5rem;
}

.header {
  @include font-category('display-small');

}

.subheading {
  @include font-category('subheading');
}

.subtitle {
  font-size: 12px;
  font-weight: 400;
  margin-top: 0.5rem;
}

.session-info {
  background-color: #F7FBFE;
  padding: 2rem 3.5rem 3.5rem 3.5rem;

  &-stepper-container {
    @include flex-container(row);
  }
  
  &-responses {
    @include flex-container(column, space-between, normal);
    margin-left: 1.06rem;
  }

  &-title {
      @include font-category('helper-text');
      color: #565961;

      @include breakpoint-below('small') {
        font-size: 12px;
      }
  }

  &-response {
    @include font-category('subheading');

    @include breakpoint-below('small') {
        font-size: 14px;
      }
  }
}

.alert {
  @include flex-container(row, normal, center);
  padding: 0;
  margin-top: 1.25rem;

  &-icon {
    height: 14.25px;
    width: 14px;
    margin-right: 0.5rem;
  }
}

.cross-icon {
  height: 9px;
  width: 9px;
  margin-left: 100%;
}

.tip {
  background-color: $c-background-blue;
  font-size: 12px;
  margin-top: 1rem;
  padding: 1rem;

  &-title {
    color: $c-information-blue;
    font-weight: 600;
  }

  &-text {
    font-weight: $font-weight-regular;
  }
}
</style>