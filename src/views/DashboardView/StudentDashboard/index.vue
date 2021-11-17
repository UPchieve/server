<template>
  <div class="student-dashboard">
    <dashboard-banner />
    <div class="dashboard-notices">
      <div
        v-if="showGatesQualifiedBanner && isGatesQualified"
        class="dashboard-notice dashboard-notice--info"
      >
        Join our research study to earn $$ and be entered to win an iPad!
        <a
          href="https://docs.google.com/document/d/1XXIn7g3bnah18Q7NE2QvrrhZ3imGStpVPtfitiPaWCQ"
          target="_blank"
          rel="noopener noreferrer"
          class="gates__learn-more"
          >Learn more<arrow-icon class="gates__arrow-icon"
        /></a>
      </div>

      <div
        v-else-if="!downtimeMessage && noticeMessage"
        class="dashboard-notice"
        :class="isLowCoachHour && 'dashboard-notice--warn'"
      >
        {{ noticeMessage }}
      </div>

      <div
        v-if="downtimeMessage"
        class="dashboard-notice"
        :class="'dashboard-notice--downtime'"
      >
        {{ downtimeMessage }}
      </div>
    </div>

    <subject-selection />
    <first-session-congrats-modal
      v-if="showFirstSessionCongratsModal"
      :closeModal="toggleFirstSessionCongratsModal"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import DashboardBanner from '../DashboardBanner'
import SubjectSelection from './SubjectSelection'
import FirstSessionCongratsModal from './FirstSessionCongratsModal'
import moment from 'moment-timezone'
import { isEnabled } from 'unleash-client'
import { FEATURE_FLAGS } from '@/consts'
import ArrowIcon from '@/assets/arrow.svg'

const defaultHeaderData = {
  component: 'DefaultHeader'
}

const activeHeaderData = {
  component: 'RejoinSessionHeader'
}

const bannedHeaderData = {
  component: 'BannedStudentHeader'
}

export default {
  name: 'student-dashboard',
  components: {
    DashboardBanner,
    SubjectSelection,
    FirstSessionCongratsModal,
    ArrowIcon
  },
  created() {
    if (this.user && this.user.isBanned) {
      this.$store.dispatch('app/header/show', bannedHeaderData)
    }

    if (this.isSessionAlive) {
      this.$store.dispatch('app/header/show', activeHeaderData)
    }

    if (this.isFirstDashboardVisit) {
      this.$store.dispatch('app/modal/show', {
        component: 'StudentOnboardingModal',
        data: {
          showTemplateButtons: false
        }
      })
    }

    if (
      isEnabled(FEATURE_FLAGS.REFER_FRIENDS) &&
      this.hasSeenFirstSessionCongratsModal
    )
      this.toggleFirstSessionCongratsModal()

    this.currentHour = moment()
      .tz('America/New_York')
      .hour()
  },
  data() {
    return {
      currentHour: 0,
      showFirstSessionCongratsModal: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
      isFirstDashboardVisit: state => state.user.isFirstDashboardVisit
    }),
    ...mapGetters({
      isSessionAlive: 'user/isSessionAlive',
      isGatesQualified: 'productFlags/isGatesQualified'
    }),
    isLowCoachHour() {
      return this.currentHour < 12
    },
    noticeMessage() {
      if (this.currentHour >= 12 && this.currentHour <= 23)
        return 'Heads up: this is a great time to make a request! We have plenty of coaches available between 12pm - 12 am ET.'
      if (this.currentHour >= 3 && this.currentHour <= 9)
        return 'Heads up: we have very few coaches available right now. Try making requests between 12pm-12am ET when possible'
      if (
        (this.currentHour >= 0 && this.currentHour < 3) ||
        (this.currentHour >= 9 && this.currentHour < 12)
      )
        return 'Heads up: we have fewer coaches available than normal right now. Try making requests between 12pm-12am ET when possible!'

      return ''
    },
    isWithinGatesStudyPeriod() {
      const gatesStudyPeriodStart = moment()
        .utc()
        .month('October')
        .date(18)
        .startOf('day')
      const gatesStudyPeriodEnd = moment()
        .utc()
        .month('December')
        .date(17)
        .endOf('day')
      return moment()
        .utc()
        .isBetween(gatesStudyPeriodStart, gatesStudyPeriodEnd)
    },
    showGatesQualifiedBanner() {
      return (
        isEnabled(FEATURE_FLAGS.GATES_STUDY) || this.isWithinGatesStudyPeriod
      )
    },
    downtimeMessage() {
      if (isEnabled('downtime-banner-4-10')) {
        return 'UPchieve will be down for maintenance 9-10 AM ET on Saturday, April 10.'
      } else {
        return ''
      }
    },
    hasSeenFirstSessionCongratsModal() {
      return (
        this.user &&
        this.user.pastSessions.length === 1 &&
        !localStorage.getItem('viewedFirstSessionCongratsModal')
      )
    }
  },
  methods: {
    toggleFirstSessionCongratsModal() {
      this.showFirstSessionCongratsModal = !this.showFirstSessionCongratsModal
    }
  },
  watch: {
    isSessionAlive(isAlive, prevIsAlive) {
      if (!isAlive) {
        this.$store.dispatch('app/header/show', defaultHeaderData)
        if (
          isEnabled(FEATURE_FLAGS.REFER_FRIENDS) &&
          prevIsAlive &&
          this.hasSeenFirstSessionCongratsModal
        )
          this.toggleFirstSessionCongratsModal()
      } else {
        this.$store.dispatch('app/header/show', activeHeaderData)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.student-dashboard {
  @include flex-container(column);
  padding: 40px 20px;

  @include breakpoint-above('medium') {
    display: inline-flex;
    min-width: 100%;
    padding: 40px;
  }
}

.dashboard-notice {
  padding: 15px;
  background-color: $c-success-green;
  border-radius: 8px;
  margin-top: 20px;
  font-weight: 500;
  font-size: 16px;
  color: #fff;

  &:last-child {
    // TODO: a cleaner way to handle spacing issues with class SubjectSelection
    margin-bottom: -20px;
  }

  &--warn {
    background-color: $c-warning-orange;
  }

  &--info {
    background-color: $c-information-blue;
  }

  &--downtime {
    background-color: $c-error-red;
  }
}

.gates {
  &__learn-more {
    color: #fff;
    text-decoration: underline;
  }

  &__arrow-icon {
    fill: currentColor;
    height: 16px;
    width: 16px;
    margin-left: 0.25em;
  }
}
</style>
