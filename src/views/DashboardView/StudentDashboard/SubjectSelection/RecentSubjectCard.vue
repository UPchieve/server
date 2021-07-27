<template>
  <large-button
  class="SubjectButton">
    <div class="SubjectCard-desktop-column">
      <component class="SubjectCard-icon" v-bind:is="svg" />
      <h4 class="SubectCard-title">{{ buttonText }} </h4>
      <arrow-icon
        v-if="showArrow"
        class="arrow-icon"
       />
    </div>
  </large-button>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import getCookie from '@/utils/get-cookie'
import ArrowIcon from '@/assets/arrow.svg'
import LargeButton from '@/components/LargeButton'

export default {
  name: 'subject-card',
  components: {ArrowIcon, LargeButton},
  data() {
    return {
      selectedSubtopic: ''
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeoutId)
  },
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: 'Join a chat room to start.'
    },
    svg: {
      type: Object,
      required: true
    },
    topic: String,
    subtopics: Array,
    subtopicDisplayNames: Object,
    buttonText: {
      type: String,
      default: 'Subject'
    },
    routeTo: String,
    disableSubjectButton: Boolean,
    showArrow: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState({
      latestSession: state => state.user.latestSession,
      isMobileApp: state => state.app.isMobileApp,
      user: state => state.user.user
    }),
    ...mapGetters({
      mobileMode: 'app/mobileMode',
      isSessionAlive: 'user/isSessionAlive'
    }),
    disabled() {
      return this.disableSubjectButton
    }
  },
  methods: {
    handleClick() {
      const hasSentPushTokenRegister = getCookie('hasSentPushTokenRegister')

      // show the notifications modal for tablet users on the mobile app
      if (
        this.isMobileApp &&
        this.selectedSubtopic !== '' &&
        !hasSentPushTokenRegister
      ) {
        this.$store.dispatch('app/modal/show', {
          component: 'NotificationsModal',
          data: {
            backText: 'Dashboard',
            acceptText: 'Yes, please notify me!',
            selectedSubtopic: this.selectedSubtopic,
            topic: this.topic,
            showTemplateButtons: false
          }
        })
      } else if (this.title === 'Invite Your Friends') {
        this.$store.dispatch('app/modal/show', {
          component: 'ReferralModal',
          data: {
            svg: this.svg,
            showAccept: false
          }
        })
      } else {
        this.$store.dispatch('app/modal/show', {
          component: 'SubjectSelectionModal',
          data: {
            backText: 'Dashboard',
            acceptText: this.topic === 'college' ? 'Start a chat' : 'Continue',
            topic: this.topic,
            subtopics: this.subtopics,
            subtopicDisplayNames: this.subtopicDisplayNames,
            svg: this.svg,
            preSelectedSubtopic: this.selectedSubtopic
          }
        })
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.SubjectButton {
    @include flex-container(row, center, center);
  @include font-category('button');

  position: absolute;
  align-items: center;
  width: 285px;
  height: 64px;
  left: 15px;
  top: 15px;
  background-color: white;
  border: 1px solid #D8DEE5;
  box-sizing: border-box;
  border-radius: 8px;

  &:hover {
    background: darken( #F2FBF9, 0%);
    border: 1px solid #16D2AA;
  }

  &:active {
    background: darken( #F1F3F6, 0%);
    border: 1px solid #ABB2BD;
  }
  &:disabled {
    background: darken(#F1F3F6, 0%);
    border: 1px solid #D8DEE5;
  }
}

.arrow-icon {
  position: absolute;
  left: 87.86%;
  right: 2.89%;
  top: 13%;

/* UPchieve Green */
border: 1px solid #16D2AA;
box-sizing: border-box;
}

.SubjectButton-icon {
  position: static;
  width: 40px;
  height: 40px;
  left: 24px;
  top: 12px;
}

.SubjectButton-title {
  @include font-category('heading');
  padding: 0;
  text-align: left;
  font-family: Work Sans;
  font-style: normal;
  font-size: 20px;

  @include breakpoint-above('medium') {
    @include font-category('display-small');
    white-space: nowrap;
  }
}

.SubjectCard-mobile-column {
  @include flex-container(column, center, flex-start);
  @include child-spacing(top, 8px);
}

.SubjectCard-desktop-column {
  @include flex-container(column, initial, center);
  @include child-spacing(top, 16px);

.ButtonTemplate-icon {
  margin-top: 2px; // nudge down
  margin-left: 8px; // space between text
}
}
</style>