<template>
  <button class="SubjectButton">
      <div class="SubjectCard-desktop-column">
        <component class="SubjectCard-icon" v-bind:is="svg" />
        <h2 class="SubjectButton-title">{{ title }}</h2>
      </div>
      <arrow-icon
       v-if="showArrow"
       class="arrow-icon"
    />
  </button>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import ButtonTemplate from '@/components/ButtonTemplate'
import getCookie from '@/utils/get-cookie'
import ArrowIcon from '@/assets/arrow.svg'
//import SubjectIcons from '..../assets/subject_icons'

export default {
  name: 'subject-card',
  components: {ButtonTemplate, ArrowIcon, SubjectIcons},
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
      default: 'Start a chat'
    },
    routeTo: String,
    disableSubjectCard: Boolean,
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
      return this.disableSubjectCard
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
  @include font-category('button');
  @include flex-container(row, center, center);

  position: absolute;
  align-items: center;
  width: 285px;
  height: 64px;
  left: 20px;
  top: 20px;
  background: #F2FBF9;
/* UPchieve Green */
  border: 1px solid #16D2AA;
  box-sizing: border-box;
  border-radius: 8px;
}

.arrow-icon {
  position: absolute;
left: 87.86%;
right: 2.89%;
top: 50%;
bottom: 50%;

/* UPchieve Green */
border: 1px solid #16D2AA;
box-sizing: border-box;
}

.SubjectCard {
  @include flex-container(row, flex-start);
  @include child-spacing(left, 24px);

  background: white;
  border-radius: 8px;
  padding: 16px;


  @include breakpoint-above('medium') {
    @include flex-container(column, space-between, center);
    @include child-spacing(left, 0);
    @include child-spacing(top, 32px);
    padding: 32px;
    padding-top: 24px;
  }
}

.SubjectCard-icon {
  position: static;
  width: 40px;
  height: 40px;
  left: 24px;
  top: 12px;
}

.SubjectButton-title {
  //@include font-category('heading');
  margin: 0;
  padding: 0;
  display: flex;
  text-align: center;
  font-family: Work Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;

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

  .SubjectCard-subtitle {
    margin-top: 8px;
  }

  .ButtonTemplate-icon {
  margin-top: 2px; // nudge down
  margin-left: 8px; // space between text
}
}
</style>