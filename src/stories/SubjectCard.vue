<template>
  <div class="SubjectCard">
      <div class="SubjectCard-desktop-column">
        <component class="SubjectCard-icon" v-bind:is="svg" />
        <h2 class="SubjectCard-title">{{ title }}</h2>
        <p class="SubjectCard-subtitle">{{ subtitle }}</p>
        <dropdown-list
          v-if="subtopics"
          v-model="selectedSubtopic"
          class="SubjectCard-dropdown"
          disabledOption="Choose a subject"
          :options="subtopics"
          :optionDisplay="subtopicDisplayNames"
          :disabled="disabled"
        />
      </div>
      <hyperlink-button
        v-if="routeTo"
        primary
        :routeTo="routeTo"
        :disabled="disabled"
        >{{ buttonText }}</hyperlink-button
      >
      <large-button
        v-else
        primary
        @click.native="handleClick"
        :disabled="disabled"
        >{{ buttonText }}</large-button
      >
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import DropdownList from '@/components/DropdownList'
import HyperlinkButton from '@/components/HyperlinkButton'
import LargeButton from '@/components/LargeButton'
import getCookie from '@/utils/get-cookie'

export default {
  name: 'subject-card',
  components: { DropdownList, HyperlinkButton, LargeButton },
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
    disableSubjectCard: Boolean
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
.SubjectCard {
  @include flex-container(row, flex-start);
  @include child-spacing(left, 24px);

  background: white;
  border-radius: 8px;
  padding: 16px;
  position: absolute;
  width: 285px;
  height: 64px;
  left: 20px;
  top: 20px;


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

.SubjectCard-title {
  @include font-category('heading');
  margin: 0;
  padding: 0;
  text-align: left;

  @include breakpoint-above('medium') {
    @include font-category('display-small');
    white-space: nowrap;
  }
}

.SubjectCard-subtitle {
  @include font-category('body');
  color: $c-secondary-grey;
  margin: 0;
  padding: 0;
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
}

.SubjectCard-dropdown {
  min-width: 260px;
}
</style>