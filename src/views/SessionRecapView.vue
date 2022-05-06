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

export default {
  components: {
    ChatLog,
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
  }
}
</script>

<style lang="scss" scoped>

</style>
