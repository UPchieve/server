<template>
  <div class="BannedStudentHeader">
    <!-- <div class="BannedStudentHeader-document"></div> -->
    <div class="BannedStudentHeader-text">{{ message }}</div>
    <div class="BannedStudentHeader-document">
      <a :href="policyURL" target="_blank"> Why am I seeing this?</a>
    </div>
  </div>
</template>

<script>
import { DOCS_URL } from '@/consts'

export default {
  name: 'banned-student-header',
  data() {
    return {
      policyURL: `${DOCS_URL}/Student-Community-Guidelines.pdf`,
      message: 'Your account is under review'
    }
  }
}
</script>

<style lang="scss" scoped>
.BannedStudentHeader {
  @include flex-container(row, center, center);
  flex: 1;
  position: relative;
}

.BannedStudentHeader-text {
  @include font-category('display-small');
  // @include flex-container(row, center, center);
  // flex-grow: 2;
  // flex-shrink: 2;
  color: white;
  font: 'Work Sans';
  font-weight: 600;
  font-size: 18px;
}

.BannedStudentHeader-document {
  a {
    color: white;
  }

  // @include flex-container(row, flex-end, center);
  @include child-spacing(left, 20px);
  // flex: 1 1 5%;
  font: 'Work Sans';
  font-weight: 400;
  font-size: 16px;
  top: 0;
  right: 0;
  position: absolute;

  // @include breakpoint-below('small') {
  //   flex-basis: auto;
  // }
}
</style>
