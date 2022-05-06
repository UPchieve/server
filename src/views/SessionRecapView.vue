<template>
  <div class="session-recap-page">
    <div class="recap-card">
      <h2 class="title" >Session Recap</h2>
      <div class="border--thin"></div>
      <div class="card-detail-title">Subject:</div>
      <div class="card-detail-title">Time:</div>
      <div class="card-detail-title">Coach:</div>
      <div>
        <div class="card-detail">{{ session.subject }} </div>
        <div class="card-detail">{{ getSessionTime(session.createdAt) }} </div>
        <div class="card-detail">{{ session.volunteerFirstName }} </div>
        <favoriting-toggle 
          :initialIsFavorite="session.isFavorited"
          :volunteerName="session.volunteerFirstName"
          :volunteerId="session.volunteerId"
        />
      </div>
    </div>
    
    <div class="chat">
      <chat-log
        :messages="session.messages"
        :student="session.student"
        :volunteer="session.volunteer"
      />
    </div>
    <div class="whiteboard">
    </div>
  </div>
</template>

<script>
import ChatLog from '@/components/Admin/ChatLog'
import NetworkService from '@/services/NetworkService'
import FavoritingToggle from '@/components/FavoritingToggle.vue'

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
      session: {}
    }
  },
  async created() {
    const {
      body: { session }
    } = await NetworkService.getSessionRecap(this.$route.params.sessionId)
    this.session = session
  },
  methods: {
    getSessionTime(sessionCreatedAt) {
      return moment(sessionCreatedAt).format('l , h:mm A')
    }
  }
}
</script>

<style lang="scss" scoped>
.title{
  @include font-category('display-small');
}

.session-recap-page {

}

.recap-card {
  @include flex-container(row, center, center);
}

.card-detail-title {
  font-size: 18px;
  font-weight: 500;
}

.card-detail {
  @include font-category('heading');
}

.border--thin {
  width: 100%;
  border-bottom: 2px solid $c-background-grey;
  margin: 0 auto;
}
</style>
