<template>
  <modal :closeModal="closeModal">
    <div class="favorited-list-full-modal">
      <header>
        <h1 class="favorited-list-full-modal-title">
          Your Favorite Coach list is full
        </h1>
      </header>

      <h2 class="favorited-list-full-modal-subtitle">
        You must unfavorite a coach from your "Favorite Coach" list in order to favorite a new coach.
      </h2>

      <footer>
        <div class="favorited-list-full-modal-buttons">
          <large-button @click.native="closeModal">Okay</large-button>
          <large-button primary class="favorited-list-full-modal-redirectButton" :routeTo="routeTo"
            >Go to my list</large-button
          >
        </div>
      </footer>
    </div>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import LargeButton from '@/components/LargeButton'

export default {
  name: 'favorited-list-full-modal',
  components: { Modal, LargeButton },
  props: {
    closeModal: { type: Function, required: true },
  },
  data() {
    return {
      // update to coach list route
      routeTo: ''
    }
  }
}
</script>

<style lang="scss" scoped>

.favorited-list-full-modal {
  @include flex-container(column);
  &-title{
    @include font-category('display-small');  
  }

  &-subtitle{
    @include font-category('body');
    margin-top: 2.82em;
    font-size: 18px;
  }

  &-buttons{
    @include flex-container(row, space-evenly);
  }

  &-redirectButton {
    background-color: $c-information-blue;
    color: white; 
  }
}

</style>

