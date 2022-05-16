<template>
  <div class="session-recap-page">
    <div class="chat-card-editor-container">
        <div class="recap-card">
          <h2 class="card-title" >Session Recap</h2>
          <div class="border--thin"></div>
          <div class="spacing--grid">
            <span class="card-detail__title">Subject:</span>
            <div class="card-detail__sub-container">
              <div class="card-detail" >{{ session.subject }} </div>
              <component v-bind:is="session.svg" class="subject-icon card-detail" />
            </div>
            <span class="card-detail__title">Time:</span>
            <div class="card-detail">{{ getSessionTime(session.createdAt) }} </div>
            <span class="card-detail__title">Coach:</span> 
            <div class="card-detail card-detail__sub-container">
              <div class="card-detail">{{ session.volunteerFirstName }} </div>
              <favoriting-toggle 
              :initialIsFavorite="session.isFavorited"
              :volunteerName="session.volunteerFirstName"
              :volunteerId="session.volunteerId"
              class="heart"
              />
            </div>
          </div>
        </div>
        <chat-log
          v-if="mobileMode"
          class="chat"
          :messages="session.messages"
          :studentId="session.studentId"
          :volunteerId="session.volunteerId"
        />
        <div
          v-if="session.quillDoc"
          class="document"
        >
          <h2 class="document__title">Doc Editor</h2>
          <div class="border--thin"></div>
          <div class="quill-container"></div>
        </div>
        <div
          v-if="session.hasWhiteboardDoc"
          class="document"
        >
          <h2 class="document__title">Whiteboard</h2>
          <div class="border--thin"></div>
          <p v-if="loadingWhiteboardError" class="error">
            {{ loadingWhiteboardError }}
          </p>
          <div id="zwibbler-container"></div>
        </div>
      <chat-log
        v-if="!mobileMode"
        :messages="session.messages"
        :studentId="session.studentId"
        :volunteerId="session.volunteerId"
      />
    </div>
  </div>
</template>

<script>
import ChatLog from '@/components/ChatLog'
import NetworkService from '@/services/NetworkService'
import FavoritingToggle from '@/components/FavoritingToggle.vue'
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import Quill from 'quill'
import config from '../config'
import MathSVG from '@/assets/subject_icons/math.svg'
import CollegeSVG from '@/assets/subject_icons/college-counseling.svg'
import ScienceSVG from '@/assets/subject_icons/science.svg'
import SATSVG from '@/assets/subject_icons/sat.svg'
import ReadingWritingSVG from '@/assets/subject_icons/more-resources.svg'

export default {
  components: {
    ChatLog,
    FavoritingToggle
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
    ...mapGetters({
      mobileMode: 'app/mobileMode'
    }),
    svgs() {
      return {
        math: MathSVG,
        college: CollegeSVG,
        science: ScienceSVG,
        readingWriting: ReadingWritingSVG,
        sat: SATSVG
      }
    },
  },
  data() {
    return {
      session: {},
      quillEditor: null,
      loadingWhiteboardError: '',
      zwibblerCtx: null,
    }
  },
  async created() {
    const response = await NetworkService.getSessionRecap(this.$route.params.sessionId)
    this.session = response.body.session
    this.session.svg = this.svgs[this.session.topic]
    
    // Set quill document after the DOM has been updated to show session div
    this.$nextTick(async () => {
      if (this.session.quillDoc) {
        const container = document.querySelector('.quill-container')
        this.quillEditor = new Quill(container)
        this.quillEditor.enable(false)
        this.quillEditor.setContents(JSON.parse(this.session.quillDoc))
      }

      if (this.session.hasWhiteboardDoc) {
        this.zwibblerCtx = window.Zwibbler.create('zwibbler-container', {
          showToolbar: false,
          showColourPanel: false,
          collaborationServer: `${config.websocketRoot}/whiteboard/recap/${this.session.id}`,
          readOnly: true
        })

        this.zwibblerCtx.setPaperSize(1000, 2800)
        this.resizeViewRectangle()

        try {
          await this.zwibblerCtx.joinSharedSession(this.session.id, false)
        } catch (error) {
          this.loadingWhiteboardError = 'Failed to load the whiteboard.'
        }

        this.zwibblerCtx.on('connected', () => {
          this.zwibblerCtx.usePanTool()
          try {
            this.zwibblerCtx.setViewRectangle(
              this.zwibblerCtx.getBoundingRectangle(
                this.zwibblerCtx.getAllNodes()
              )
            )
          } catch (error) {
            this.zwibblerCtx.setViewRectangle({
              x: 0,
              y: 0,
              width: 1,
              height: 1
            })
          }
        })
      }
    })
  },
  methods: {
    getSessionTime(sessionCreatedAt) {
      return moment(sessionCreatedAt).format('l, h:mm A')
    },
    resizeViewRectangle() {
      this.zwibblerCtx.setViewRectangle({
        x: 0,
        y: 0,
        width: 1000,
        height: 1
      })
    }
  }
}
</script>

<style lang="scss">
.quill-container {
  width: auto !important;
}

.unfavoriting-modal-title {
  text-align: center;
}
</style>

<style lang="scss" scoped>
.card-title{
  @include font-category('display-small');
  text-align: left;
}

.chat-card-editor-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 1300px;

  @include breakpoint-below('large') {
    height: 100%;
  }
}
.session-recap-page {
  padding: 35px;
}

.recap-card {
  background-color: $upchieve-white;
  border-radius: 8px 8px 16px 16px;
  padding: 22px;
  margin-right: 1.8em;
  margin-bottom: 1.8em;
}

.spacing--grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
}

.card-detail {
  @include font-category('heading');
  text-align: left;
  margin: 1em 0.5em 0.5em 0.5em;

  &__title {
    font-size: 18px;
    font-weight: 500;
    text-align: left;
    margin: 1em 0.5em 0.5em 0.5em;
  }

  &__sub-container {
    @include flex-container(row,normal,center);
    margin: 0;
  }
}

.chat {
  margin-bottom: 1.8em;
}

.document {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 1.8em;
  margin-bottom: 1.8em;
  font-size: 20px;
  height: 500px;
  overflow-y: auto;
  background-color: $upchieve-white;
  padding: 22px;
  border-radius: 8px 8px 16px 16px;

  &__title {
    @include font-category('display-small');
    text-align: left;
  }
}

.border--thin {
  width: 100%;
  border-bottom: 2px solid $c-background-grey;
  margin: 0 auto;
}

.error {
  color: $c-error-red;
  margin: 1em 0;
}

.subject-icon {
  height: 24px;
  width: 24px;
}

.heart {
  width: 18.46px;
  height: 17.14px;
  padding-left: 4px;
}
</style>
