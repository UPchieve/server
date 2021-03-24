<template>
  <div class="student-dashboard">
    <dashboard-banner />
    <!--    <div-->
    <!--      v-if="noticeMessage"-->
    <!--      class="dashboard-notice"-->
    <!--      :class="isLowCoachHour && 'dashboard-notice&#45;&#45;warn'"-->
    <!--    >-->
    <!--      {{ noticeMessage }}-->
    <!--    </div>-->
    <div class="dashboard-notice" :class="'dashboard-notice--warn'">
      UPchieve will be down for maintenance Saturday, March 27, from 9-10 AM
      Eastern Time.
    </div>
    <div
      class="dashboard-notice dashboard-notice--gift-card-giveaway"
      :class="'dashboard-notice--info'"
      @click="toggleGiftCardGiveawayModal"
      v-if="showGiftCardBanner"
    >
      Click here to participate in our very first social media giveaway ✨✨
      <arrow-icon class="dashboard-notice--arrow" />
    </div>
    <subject-selection />
    <gift-card-giveaway-modal
      v-if="showGiftCardGiveawayModal"
      :closeModal="toggleGiftCardGiveawayModal"
    />
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
import GiftCardGiveawayModal from './GiftCardGiveawayModal'
import ArrowIcon from '@/assets/arrow.svg'

const headerData = {
  component: 'RejoinSessionHeader',
  data: { important: true }
}

export default {
  name: 'student-dashboard',
  components: {
    DashboardBanner,
    SubjectSelection,
    FirstSessionCongratsModal,
    GiftCardGiveawayModal,
    ArrowIcon
  },
  created() {
    if (this.isSessionAlive) {
      this.$store.dispatch('app/header/show', headerData)
    }

    if (this.isFirstDashboardVisit) {
      this.$store.dispatch('app/modal/show', {
        component: 'StudentOnboardingModal',
        data: {
          showTemplateButtons: false
        }
      })
    }

    if (this.hasSeenFirstSessionCongratsModal)
      this.toggleFirstSessionCongratsModal()

    this.currentHour = moment()
      .tz('America/New_York')
      .hour()
  },
  data() {
    return {
      currentHour: 0,
      showFirstSessionCongratsModal: false,
      showGiftCardGiveawayModal: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
      isFirstDashboardVisit: state => state.user.isFirstDashboardVisit
    }),
    ...mapGetters({ isSessionAlive: 'user/isSessionAlive' }),
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
        return 'Heads up: we have less coaches available than normal right now. Try making requests between 12pm-12am ET when possible!'

      return ''
    },
    hasSeenFirstSessionCongratsModal() {
      return (
        this.user &&
        this.user.pastSessions.length === 1 &&
        !localStorage.getItem('viewedFirstSessionCongratsModal')
      )
    },
    showGiftCardBanner() {
      // Midnight EST Time
      const lastDayToShowBanner = '2021-03-29T03:59:59.999+00:00'
      return new Date().getTime() < new Date(lastDayToShowBanner).getTime()
    }
  },
  methods: {
    toggleFirstSessionCongratsModal() {
      this.showFirstSessionCongratsModal = !this.showFirstSessionCongratsModal
    },
    toggleGiftCardGiveawayModal() {
      this.showGiftCardGiveawayModal = !this.showGiftCardGiveawayModal
    }
  },
  watch: {
    isSessionAlive(isAlive, prevIsAlive) {
      if (!isAlive) {
        this.$store.dispatch('app/header/show')
        if (prevIsAlive && this.hasSeenFirstSessionCongratsModal)
          this.toggleFirstSessionCongratsModal()
      } else {
        this.$store.dispatch('app/header/show', headerData)
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
  margin: 20px 0 -20px;
  font-weight: 500;
  font-size: 16px;
  color: #fff;

  &--warn {
    background-color: $c-warning-orange;
  }

  &--info {
    background-color: $c-information-blue;
  }

  &--gift-card-giveaway {
    @include flex-container(row, center, center);
    margin-top: 2em;

    &:hover {
      cursor: pointer;
    }
  }

  &--arrow {
    fill: #fff;
    width: 20px;
  }
}
</style>
