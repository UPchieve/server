<template>
<div>
      <section class="header">
      <h1 class="title">
        Session
      </h1>
      <p class="subtitle">
        On this page you can review your past sessions on UPchieve and favorite your preferred Academic Coaches. We’ll do our best to pair you with your favorited coaches when they’re available.      
      </p>
    </section>
  <div class="container">
    <section>
      <div class = "spacing--grid title-headers">
        <span> Session History </span>
        <span> Favorite Coaches </span>
      </div>
      <div class="spacing--grid session-list__headers">
        <span>SUBJECT</span>
        <span>DATE</span>
        <span>COACH</span>
      </div>
      <ul class="session-list">
        <li v-for="(session, index) in sessions" :key="session._id">
          <div class="session-list__session">
            <div class="session-list__subject-container">
            <component v-bind:is="session.svg" class="subject-icon" />
              <div class="subject-name-container">
              <div
                class="subject"
                >{{ session.subject }}</div
              >
              <span class="subject-time-tutored"> {{ getSessionDuration(session.timeTutored) }} minutes</span>
              </div>
            </div>
            <span class="session-list__created-at"
              >{{ getSessionDate(session.timeTutored) }} @ {{ getSessionTimeTutored(session.timeTutored) }}</span
            >
            <div class="session-list__coach-name-container">
            <favoriting-toggle
              :initialIsFavorite="session.isFavorite"
              :volunteerName="session.volunteerFirstName"
              :volunteerId="session.volunteerId"
            />
            <span class="session-list__coach-name"> {{ session.volunteerFirstName }} </span>
            </div>
          </div>
          <div class="border--thin" v-if="index !== 4"></div>
        </li>
      </ul>
        <footer class="page-actions-container">
        <div class="page-actions">
          <div
            @click="() => getSessionHistory(page - 1)"
            :class="isFirstPage && 'page-actions__stepper--disabled'"
            class="page-actions__stepper"
          >
            <caret-icon class="caret caret--previous" /><span v-if="!mobileMode"
              >Previous</span
            >
          </div>
          <div class="page-numbers">
            <span
              v-for="pageNum in totalPages"
              :key="pageNum"
              :class="pageNum === page && 'page-num--active'"
              class="page-num"
              @click="() => handlePageClick(pageNum)"
            >
              {{ pageNum }}
            </span>
          </div>
          <div
            @click="() => getSessionHistory(page + 1)"
            :class="isLastPage && 'page-actions__stepper--disabled'"
            class="page-actions__stepper"
          >
            <span v-if="!mobileMode">Next</span
            ><caret-icon class="caret caret--next" />
          </div>
        </div>
      </footer>
    </section>
  </div>
</div>
</template>

<script>
import MathSVG from '@/assets/subject_icons/math.svg'
import CollegeSVG from '@/assets/subject_icons/college-counseling.svg'
import ScienceSVG from '@/assets/subject_icons/science.svg'
import SATSVG from '@/assets/subject_icons/sat.svg'
import ReadingWritingSVG from '@/assets/subject_icons/more-resources.svg'
import NetworkService from '../services/NetworkService'
import CaretIcon from '@/assets/caret.svg'
import FavoritingToggle from '../components/FavoritingToggle.vue'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'session-history-view',
  components: { MathSVG, CollegeSVG, ScienceSVG, SATSVG, ReadingWritingSVG, CaretIcon, FavoritingToggle},
  data() {
     const svgs = {
      math: MathSVG,
      college: CollegeSVG,
      science: ScienceSVG,
      readingWriting: ReadingWritingSVG,
      sat: SATSVG
    }

    return {
      sessions: [],
      isLastPage: true,
      page: 1,
      hasNext: false,
      svgs,
      total: 0
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.user.user,
    }),
    ...mapGetters({
      mobileMode: 'app/mobileMode',
    }),
    isFirstPage() {
      return this.page === 1
    },
    totalPages() {
      const sessionLimitPerPage = 5
      const totalPages = Math.ceil(this.total / sessionLimitPerPage)
      return totalPages === 0 ? 1 : totalPages
    }
  },
  methods: {
    async getSessionHistory(page) {
      if (page < 1 || page > this.totalPages) return
      const response = await NetworkService.mockGetSessionHistory(page)
      this.sessions = response.body.sessions
      // this.isLastPage = response.body.isLastPage
      // this.page = page
    },
    async handlePageClick(page) {
      if (this.page === page) return
      await this.getFavoriteCoaches(page)
    },
    getSessionTopicIcons() {
      this.sessions = this.sessions.map((session) => {
          session.svg = this.svgs[session.topic]
          return session
      })
    },
    getSessionTimeTutored(timeTutored) {
      // const sessionTime = timeTutored.getTime(
      // return sessionTime
      return timeTutored
    },
    getSessionDate(timeTutored) {
      // const sessionDate = timeTutored.getDate()
      // return sessionDate
      return timeTutored
    },
    getSessionDuration(timeTutored) {
     // const duration = this.getSessionTimeTutored(timeTutored)/60000
      return timeTutored
    },
   },
  async created() {
    await this.getSessionHistory(this.page)
    this.getSessionTopicIcons()
  }
}

</script>

<style lang="scss" scoped> 
ul {
  padding: 0px;
  height: 100%;
  margin: auto;
  list-style-type: none;
}

.header {
  text-align: left;
  margin-bottom: 2em;
}

.title {
  font-weight: 500;
  font-size: 22px;
  margin-bottom: 1em;

  &-headers {
    font-weight: 500;
    font-size: 20px;
    margin-bottom: 1em;
    text-align: left;
  }
}

.subtitle {
  @include font-category('heading');
  color: $c-secondary-grey;
}

.container {
  padding: 1.5em;
  margin: 0;
  background-color: white;
  border: 1px solid $c-border-grey;
  min-width: 100%;

  @include breakpoint-above('large') {
    padding: 2.5em 2.5em 0 2.5em;
  }
}

.spacing--grid {
  @include flex-container(row, space-around, center);
  display: grid;
  @include breakpoint-above('tiny') {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @include breakpoint-below('medium') {
    flex-direction: column;
  }
}

.session-list {
  min-height: 696px;
  padding: 0 2em;

  &__headers {
    @include font-category('subheading');
    background-color: $c-background-blue;
    width: 100%;
    padding: 1em 2em;
  }

  &__coach-name {
      @include font-category('subheading');
      margin: 0.8em;
      &-container {
        @include flex-container(row, center, center);
      }
    }
  
  &__session {
    @include flex-container(row, space-around, center);
    display: grid;
    @include breakpoint-above('tiny') {
    grid-template-columns: 1fr 1fr 1fr;
  }
    padding: 1.2em 0;
  }
  
  &__subject-container {
    @include flex-container(row, initial, center);
  }

  &__created-at {
    @include font-category('subheading')
  }
}

.subject {
  text-align: left;
  @include font-category('heading');

  &-icon {
  height: 50px;
  width: 50px;
  margin-left: 1.375em;
  }

  &-name-container {
    @include flex-container(column, center, flex-start);
    margin: 1.375em;
  }

  &-time-tutored {
    @include font-category('helper-text');
    color: $c-secondary-grey;
  }

}

.border--thin {
  width: 100%;
  border-bottom: 2px solid $c-background-grey;
  margin: 0 auto;
}

.page-actions-container {
  padding: 0 2em;
}

.page-numbers {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.page-actions {
  &__stepper {
    display: flex;
    align-items: center;

    margin-right: 1em;
    color: $c-information-blue;

    & .caret path {
      fill: $c-information-blue;
    }

    &:hover {
      cursor: pointer;
    }

    @include breakpoint-above('medium') {
      margin-right: 2em;
    }

    &--disabled {
      margin-right: 1em;
      color: $c-disabled-grey;

      & .caret path {
        fill: $c-disabled-grey;
      }

      @include breakpoint-above('medium') {
        margin-right: 2em;
      }
    }
  }
}

.page-num {
  margin-right: 1em;
  @include breakpoint-above('medium') {
    margin-right: 2em;
  }
  &:hover {
    color: $c-information-blue;
    cursor: pointer;
  }

  &--active {
    color: $c-information-blue;
  }
}

.caret {
  &--previous {
    transform: rotate(90deg);
    margin-right: 0.4em;
  }

  &--next {
    transform: rotate(-90deg);
    margin-left: 0.4em;
  }
}

</style>
