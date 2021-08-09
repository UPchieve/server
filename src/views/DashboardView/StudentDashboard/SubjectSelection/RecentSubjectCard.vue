<template>
  <div
    @mouseover="showArrow = true, onHover = true"
    @mouseleave="showArrow = false, onHover = false"
  >
    <button class="SubjectCard" 
      v-bind:class="{'HoveredSubjectCard':(onHover)}"
      :disabled="disabled"
    >
      <div class="SubjectCard-desktop-column">
        <component class="SubjectCard-icon" v-bind:is="svg" />
        <h4 class="SubectCard-title">{{ title }}</h4>
        <arrow-icon 
        v-if="showArrow && disableSubjectCard===false"
        class="arrow-icon"
        />
      </div>
    </button>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import getCookie from '@/utils/get-cookie'
import ArrowIcon from '@/assets/arrow.svg'
import MathSVG from '@/assets/subject_icons/math.svg'

export default {
  name: 'recent-subject-card',
  components: { ArrowIcon, MathSVG },
  data() {
    return {
      onPressed: ''
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
    svg: {
      type: Object,
      required: true,
      default: MathSVG
    },
    topic: String,
    buttonText: {
      type: String,
      default: 'Subject'
    },
    routeTo: String,
    disableSubjectCard: {
      type: Boolean,
      default: false
    },
    showArrow: {
      type: Boolean,
      default: false
    },
    onHover: {
      type: Boolean,
      default: false
    },
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
.SubjectCard{
  @include flex-container(row, center, center);
  @include font-category('button');
  @include child-spacing(left, 24px);

  align-items: center;
  width: 350px;
  height: 96px;
  margin-left: 0px;
  margin-right: 24px;
  background-color: white;
  border: 1px solid #d8dee5;
  box-sizing: border-box;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: 0.5s;
}

// .SubjectCard:hover:enabled{
//     background: darken(#f2fbf9, 0%);
//     border: 1px solid #16d2aa;
// }

.SubjectCard:active:enabled{
    background-color: darken(#f1f3f6, 0%);
    border: 1px solid #abb2bd;
}

.HoveredSubjectCard:enabled{
    background-color: darken(#f2fbf9, 0%);
    border: 1px solid #16d2aa;
}

// .ActiveSubjectCard:enabled{
//     background-color: darken(#f1f3f6, 0%);
//     border: 1px solid #abb2bd;
// }

.arrow-icon {
  position: absolute;
  left: 85%;
  right: 2.89%;
  top: 18%;
  width: 24px;
  height: 30px;

  /* UPchieve Green */
  box-sizing: border-box;
}

.SubjectCard-icon {
  position: absolute;
  width: 50px;
  height: 50px;
  left: 24px;
  top: 20px;
}

.SubjectCard-title {
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
}
</style>
