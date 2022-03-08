<template>
  <modal :closeModal="closeModal">
    <div class="volunteer-unfavoriting-modal">
    <header>
      <h1 class="volunteer-unfavoriting-modal-title">
        Do you want to unfavorite Coach {{ volunteerName }}?  
      </h1>
    </header>
       
    <footer>
      <div class="volunteer-unfavoriting-modal-buttons">
        <large-button @click.native="closeModal">Cancel</large-button>
        <large-button primary class="volunteer-unfavoriting-modal-unfavoriteButton" @click.native="unfavorite">Unfavorite</large-button>
      </div>
    </footer>
    </div>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import LargeButton from '@/components/LargeButton'

export default {
  name: 'volunteer-unfavoriting-modal',
  components: {Modal, LargeButton},
  props: {
    closeModal: { type: Function, required: true },
    volunteerName: {type: String, required: true}
  },
  data() {
    return {
         showFavoritedListFullModal: false,
    }
  },
  methods: {
    unfavorite() {
      this.$emit('unfavorite', false)
    }
  }
}
</script>
<style lang="scss" scoped>

.volunteer-unfavoriting-modal {
  @include flex-container(column);

  &-title {
    @include font-category('display-small');
  }

  &-buttons {
    margin-top: 1em;
    @include flex-container(row, space-evenly);
  }

  &-unfavoriteButton {
    background-color: $c-information-blue;
    color: white;
  }
}

</style>
