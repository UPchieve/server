<template>
  <div class="header">
    <div class="header-message"><span>Take the NEW Algebra 2 Quiz by March 1, 2022</span> to help us keep up with student demand!</div>
    <router-link to="/training" tag="button" class="header-button">Get certified</router-link>
  </div>
</template>

<script>

export default {
  name: 'algebra-two-launch-header',
}
</script>

<style lang="scss" scoped>

.header {
  @include header-child;
  color: $upchieve-white;
  display: flex;
  align-items: center;
  background-color: $c-information-blue;

  &-message {
    margin-left: auto;

    & span {
      font-weight: 500;
    }
  }

  &-button {
    margin-left: auto;
    color: $c-soft-black;
    background-color: $upchieve-white;
    border: none;
    border-radius: 20px;
    padding: 0.4em 1.2em;
    font-weight: 600;

    &:hover {
      background-color: darken($upchieve-white, 5%);
    }
  }
}
</style>



