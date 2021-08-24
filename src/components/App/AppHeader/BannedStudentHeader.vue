<template>
  <div class="top-banner-text">{{ message }}</div> </template
>>

<script>
import { DOCS_URL } from '../../../config'

export default {
  name: 'banned-student-header',
  props: {
    headerData: Object,
    docsUrl: DOCS_URL
  },
  computed: {
    message() {
      return 'Your account is under review'
    }
  }
}
</script>

<style lang="scss" scoped>
// .top-banner-notice{
//   // display: flex;
//   //background-color: yellow;
//   // height: 64px;
//   // @include breakpoint-above('medium') {
//   //   display: inline-flex;
//   //   min-width: 100%;
//     padding: 40px;
//   }

.top-banner-text {
  @include font-category('display-small');
  display: flex;
  color: white;
  font: 'Work Sans';
  font-weight: 600;
  font-size: 18px;
}
</style>
