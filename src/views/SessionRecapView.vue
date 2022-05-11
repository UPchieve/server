<template>
  <div class="session-recap-page">
    <div class="chat-container">
      <!-- <div class="card-editor-container"> -->
        <div class="recap-card">
          <h2 class="card-title" >Session Recap</h2>
          <div class="border--thin"></div>
          <div class="spacing--grid">
            <span class="card-detail__title">Subject:</span>
            <div class="card-detail">{{ session.subject }} </div>
            <span class="card-detail__title">Time:</span>
            <div class="card-detail">{{ getSessionTime(session.createdAt) }} </div>
            <span class="card-detail__title">Coach:</span> 
            <div class="card-detail card-detail__coach-name">
              <div class="card-detail">{{ session.volunteerFirstName }} </div>
              <favoriting-toggle 
              :initialIsFavorite="session.isFavorited"
              :volunteerName="session.volunteerFirstName"
              :volunteerId="session.volunteerId"
              />
            </div>
        </div>
        </div>
        <!-- <h2 class="document__title">Doc Editor</h2>
        <div class="border--thin"></div>
        <div
          v-if="session.quillDoc"
          class="document"
        >
          <div class="quill-container"></div>
        </div>
        <div class="whiteboard">
        </div> -->
      <!-- </div> -->
      <div>
      <div class="chat-header">
        <component class="chat-header__avatar" :is="studentAvatar"/>
        <div class="chat-header__title">Session Chat</div>
      </div>
      <div class="chat-contents">
        <template v-for="(message, index) in session.messages">
          <div
            :key="`message-${index}`"
            :class="messageAlignment(message)"
            class="message"
          >
            <component class="avatar" :is="avatar(message)" v-if="message.user !== user._id"/>
              <div class="contents" :class="chatBotContents(message)">
                <span>{{ message.contents }}</span>
              </div>
              <div class="time">
                {{ message.createdAt | formatTime }}
              </div>
          </div>
        </template>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatLog from '@/components/Admin/ChatLog'
import NetworkService from '@/services/NetworkService'
import FavoritingToggle from '@/components/FavoritingToggle.vue'
import { mapState } from 'vuex'
import moment from 'moment'
import Quill from 'quill'
import getChatAvatar from '@/utils/get-chat-avatar'
import StudentIcon from '@/assets/student-icon.svg'

const MESSAGE_ALIGNMENT = {
  LEFT: 'left',
  RIGHT: 'right'
}

export default {
  components: {
    ChatLog,
    FavoritingToggle
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
  },
  data() {
    return {
      session: {},
      quillEditor: null,
      studentAvatar: StudentIcon
    }
  },
  async created() {
    const response = await NetworkService.getSessionRecap(this.$route.params.sessionId)
    this.session = response.body.session
    
    // Set quill document after the DOM has been updated to show session div
    this.$nextTick(async () => {
      if (this.session.quillDoc) {
        const container = document.querySelector('.quill-container')
        this.quillEditor = new Quill(container)
        this.quillEditor.enable(false)
        this.quillEditor.setContents(JSON.parse(this.session.quillDoc))
        console.log('quill doc', this.quillEditor)
      }
    })
  },
  methods: {
    getSessionTime(sessionCreatedAt) {
      return moment(sessionCreatedAt).format('l, h:mm A')
    },
    messageAlignment(message){
      return message.user === this.user._id ? MESSAGE_ALIGNMENT.RIGHT : MESSAGE_ALIGNMENT.LEFT
    },
    avatar(message){
      return getChatAvatar(message.user, this.session.studentId, this.session.volunteerId)
    },
    chatBotContents(message){
      const isStudentMessage = message.user === this.session.studentId
      const isVolunteerMessage = message.user === this.session.volunteerId
      if (!isStudentMessage && !isVolunteerMessage)
        return 'contents--chat-bot'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.card-title{
  @include font-category('display-small');
  text-align: left;
}

.card-editor-container {
  @include flex-container(column, center, center);
}

.chat-container {
  @include flex-container(row, center, flex-start);
  padding: 0;
}
.session-recap-page {
  padding: 35px;
}

.recap-card {
  // @include flex-container(row, center, center);
  width: 702px;
  background-color: $upchieve-white;
  border-radius: 8px 8px 16px 16px;
  padding: 22px;
  margin-right: 1.8em;
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

  &__coach-name {
    @include flex-container(row,normal,center);
    margin: 0;
  }
}

.document {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 10px 0;
  font-size: 20px;
  height: 500px;
  overflow-y: auto;

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

.quill-container {
  width: 702px;
  height: 535px;
}

.chat-contents {
  position: relative;
  background-color: $upchieve-white;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  max-height: 858px;
  width: 392px;
  border-radius: 0px 0px 8px 8px;
}

.chat-header {
  position: relative;
  height: 100%;
  background-color: $c-information-blue;
  padding: 21px;
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  border-radius: 8px 8px 0px 0px;
  width: 392px;

  &__avatar {
    width: 40px;
    height: 40px;
  }

  &__title {
    font-weight: 600;
    font-size: 18px;
    color: #fff;
    margin-left: 1em;
  }

  // @include breakpoint-below('medium') {
  //   border-radius: 0px 0px 20px 20px;
  //   height: 69px;
  // }
}

.message {
  position: relative;
  padding: 1.5em;
  display: flex;
  justify-content: flex-start;

  /* Safari needs this specified to lay out the message divs properly. */
  flex-shrink: 0;
}

.left {
  .time {
    margin-left: 44px;
  }
}

.right {
  flex-direction: row-reverse;

  .contents {
    background-color: $c-background-blue;
  }
}

.avatar {
  width: 32px;
  height: 32px;
  margin-top: 0.3125em;
  border-radius: 16px;
  margin-right: 0.75em;
}

.time {
  font-size: 14px;
  font-weight: 500;
  color: #73737a;
  position: absolute;
  bottom: 0;
}

.contents {
  text-align: left;
  padding: 0.625em 0.875em;
  overflow-wrap: break-word;
  background-color: $c-background-grey;
  border-radius: 20px;
  max-width: 80%;
  white-space: pre-line;

  &--chat-bot {
    background-color: $upchieve-chat-bot-green;
  }
}
</style>
