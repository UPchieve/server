<template>
  <modal :closeModal="closeModal">
    <div class="FavoritedListFullModal">
      <header>
        <h1 class="FavoritedListFullModal-title">
          Your Favorite Coach list is full
        </h1>
      </header>

      <h2 class="FavoritedListFullModal-subtitle">
        You must unfavorite a coach from your "Favorite Coach" list in order to favorite a new volunteer.
      </h2>

      <footer>
        <div class="FavoritedListFullModal-buttons">
          <large-button @click.native="closeModal">Okay</large-button>
          <large-button primary class="FavoritedListFullModal-redirectButton"
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
}
</script>

<style lang="scss" scoped>

.FavoritedListFullModal {
  @include flex-container(column);
  &-title{
    @include font-category('display-small');  
  }

  &-subtitle{
    @include font-category('body');
    margin-top: 79px;
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

