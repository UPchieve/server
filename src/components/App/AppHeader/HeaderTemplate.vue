<template>
  <div
    class="HeaderTemplate"
    :class="setHeaderState.class"
  >
    <slot />
  </div>
</template>

<script>
import {HEADER_STATES} from '../../../../src/consts'

export default {
  name: 'header-template',
  props: {
    headerState: String
  },
  computed: {
    setHeaderState(){
      if(this.headerState == HEADER_STATES.BANNED_STUDENT){
        this.class = 'HeaderTemplate--banned'
      }

      if(this.headerState == HEADER_STATES.ACTIVE_SESSION){
        this.class = 'HeaderTemplate--activeSession'
      }
    }  
  }
}
</script>

<style lang="scss" scoped>
.HeaderTemplate {
  @include bind-app-header-height(height);
  @include flex-container(row, space-between, center);

  background: white;
  border-radius: 0px 0px 20px 20px;
  padding: 20px;
  width: 100%;

  position: fixed;
  top: 0;
  left: 0;
  z-index: get-z('header');

  &--activeSession {
    background: $c-warning-orange;
  }

  &--banned {
    background: #8B939F;
  }

  @include breakpoint-above('medium') {
    border-radius: 0;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
    padding: 12px 20px;
  }
}
</style>
