<template>
  <div v-if="studentIsBanned" class="top-banner-notice">
      Your account is under review
    </div>
</template>

<script>
//import { defineComponent } from '@vue/composition-api'

// export default({
//   name:'banned-student-header',
//   computed() {
//     ...mapState({
//       user: state => state.user.user
//     })
//      studentIsBanned(){
//       return this.user.isBanned;
//     }
//   }
// })
// </script>

// <style lang="scss" scoped>

// .top-banner-notifice{
//   display: flex;
//   background-color: #8B939F;
//   height: 64px;
//   @include breakpoint-above('medium') {
//     display: inline-flex;
//     min-width: 100%;
//     //padding: 40px;
//   }
// }
// </style>