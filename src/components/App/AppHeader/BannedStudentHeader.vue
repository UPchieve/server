<template>
  <div v-if="studentIsBanned" class="top-banner-notice">
    <div v-if="mobileMode" class="top-banner-message--mobile">
      {{message}}
    </div>
    <div v-else class="top-banner-message">{{ message }}</div>
  </div>
</template>>

<script>
import { mapGetters } from 'vuex'

export default({
  name:'banned-student-header',
  props: {
    headerData: Object
  },
  computed: {
     ...mapGetters({
      mobileMode: 'app/mobileMode'
    }),
    message(){
      return "Your account is under review"
    }
  }
})

</script>

<style lang="scss" scoped>
.top-banner-notice{
  display: flex;
  background-color: #8B939F;
  height: 64px;
  @include breakpoint-above('medium') {
    display: inline-flex;
    min-width: 100%;
    //padding: 40px;
  }

.top-banner-text{
  @include font-category('display-small');

  &--mobile {
    @include font-category('body');
  }

  }

}

</style>
