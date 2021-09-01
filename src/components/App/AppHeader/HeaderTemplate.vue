<template>
  <div class="HeaderTemplate">
    <div class="HeaderTemplate" :class="setHeaderState.class">
      <slot />
    </div>
  </div>
</template>

<script>
import { HEADER_STATES } from '../../../../src/consts'

export default {
  name: 'header-template',
  props: {
    headerState: String
  },
  computed: {
    setHeaderState() {
      const status = {}
      if (this.headerState === HEADER_STATES.BANNED_STUDENT) {
        status.class = 'HeaderTemplate--banned'
      }

      if (this.headerState === HEADER_STATES.ACTIVE_SESSION) {
        status.class = 'HeaderTemplate--activeSession'
      }
      return status
    }
  }
}
</script>

<style lang="scss" scoped>
.HeaderTemplate {
  @include bind-app-header-height(height);
  @include flex-container(row, space-between, center);

  background-color: white;
  border-radius: 0px 0px 20px 20px;
  padding: 20px;
  width: 100%;

  position: fixed;
  top: 0;
  left: 0;
  z-index: get-z('header');

  @include breakpoint-above('medium') {
    border-radius: 0;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
    padding: 12px 20px;
  }

  &--activeSession {
    background-color: $c-warning-orange;
  }

  &--banned {
    justify-content: center;
    background-color: $c-banned-grey;
  }
}
</style>
