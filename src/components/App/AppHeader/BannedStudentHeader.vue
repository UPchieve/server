<template>
  <div class="top-banner-notice">
    <div class="top-banner-message">{{ message }}</div>
  </div>
</template>>

<script>
export default({
  name:'banned-student-header',
  props: {
    headerData: Object
  },
  computed: {
    message(){
      return "Your account is under review"
    }
  }
})

</script>

<style lang="scss" scoped>
.top-banner-notice{
  // display: flex;
  //background-color: yellow;
  // height: 64px;
  // @include breakpoint-above('medium') {
  //   display: inline-flex;
  //   min-width: 100%;
    padding: 40px;
  }

.top-banner-text{
  @include font-category('display-small');

  &--mobile {
    @include font-category('body');
  }

  }

</style>
