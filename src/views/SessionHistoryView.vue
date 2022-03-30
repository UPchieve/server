<template>
<div>
  <div class="page-description">
      <section class="header">
      <h1 class="title">
        Session History
      </h1>
      <p class="subtitle">
        On this page you can review your past sessions on UPchieve and favorite your preferred Academic Coaches. We’ll do our best to pair you with your favorited coaches when they’re available.      
      </p>
    </section>
  </div>
  <div class="container">
    <section class="session-history">
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
          <div>
            <div>
              <component v-bind:is="session.svg" class="subject-icon" />
              <div class="session-list__subject-container">
              <span
                class="session-list__subject"
                >{{ session.subject }}</span
              >
              <span class="session-list__subject-time-tutored"> {{ getSessionDuration(session.timeTutored) }} </span>
              </div>
            </div>

            <span class="session-list__created-at"
              >{{ getSessionDate(session.timeTutored) }} @ {{ getSessionTime(session.timeTutored) }}</span
            >
            <favoriting-toggle
              :initialIsFavorite="session.isFavorite"
              :volunteerName="session.volunteerFirstName"
              :volunteerId="session.volunteerId"
            />
            <span class="session-list__coach-name"> {{ session.volunteerFirstName }} </span>
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
            @click="() => getFavoriteCoaches(page + 1)"
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

export default {
  name: 'session-history-view',
  components: { MathSVG, CollegeSVG, ScienceSVG, SATSVG, ReadingWritingSVG, CaretIcon},
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
      svgs
    }
  },
  methods: {
    async getSessionHistory(page) {
      if (page < 1 || page > this.totalPages) return
      const response = await NetworkService.mockGetSessionHistory(page)
      this.sessions = response.body.sessions
      this.isLastPage = response.body.isLastPage
      this.page = page
    },
    getSessionTopicIcons() {
      this.sessions = this.sessions.map((session) => {
          session.svg = this.svgs[session.topic]
          return session
      })
    },
    getSessionTimeTutored(timeTutored) {
      const sessionTime = timeTutored.getTime()
      return sessionTime
    },
    getSessionDate(timeTutored) {
      const sessionDate = timeTutored.getDate()
      return sessionDate
    },
    getSessionDuration(timeTutored) {
      const duration = this.getSessionTimeTutored(timeTutored)/60000
      return duration
    }
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
    font-size: 20px;
  }
}

.subtitle {
  @include font-category('heading');
  color: $c-secondary-grey;
}

.container {
  padding: 1.5em;
  margin: 0;

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
  @include flex-container(row, space-evenly);
  min-height: 696px;
  padding: 0 2em;

  &__headers {
    @include font-category('subheading');
    background-color: $c-background-blue;
    padding: 1em 2em;
  }

  &__coach-name {
      @include flex-container(column, center, center);

      @include breakpoint-above('medium') {
        flex-direction: row;
      }
    }

  &__subject {
    text-align: left;
    @include font-category('heading');

    &-container {
    @include flex-container(column, center, center);
    }

    &-time-tutored {
    @include font-category('helper-text');
    color: $c-secondary-grey;
  }
}
  
  &__created-at {
    @include font-category('subheading')
  }
}

.subject-icon {
  height: 50px;
  width: 50px;
  margin-left: 1.375em;
}

.border--thin {
  width: 95%;
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
    rotate: 90deg;
    margin-right: 0.4em;
  }

  &--next {
    rotate: -90deg;
    margin-left: 0.4em;
  }
}

</style>
