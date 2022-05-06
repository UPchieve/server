<template>
  <div class="session-recap-page">
    <div class="recap-card">

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

export default {
  components: {
    ChatLog,
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
  },
  props: {
    sessionId: {
      type: Number
    }
  },
  data() {
    return {
      session: {}
    }
  },
  async created() {
    const {
      body: { session }
    } = await NetworkService.getSessionRecap()
    this.session = session
  }
}
</script>

<style lang="scss" scoped>

</style>
