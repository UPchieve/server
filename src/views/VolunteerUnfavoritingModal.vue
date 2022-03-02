<template>
  <modal :closeModal="closeModal">
    <div class="VolunteerUnfavoritingModal">
    <header>
      <h1 class="VolunteerUnfavoritingModal-title">
        Do you want to unfavorite this coach?  
      </h1>
    </header>
       
    <footer>
      <div class="VolunteerUnfavoritingModal-buttons">
        <large-button @click.native="closeModal">Cancel</large-button>
        <large-button primary class="VolunteerUnfavoritingModal-unfavoriteButton" @click.native="unfavorite">Unfavorite</large-button>
      </div>
    </footer>
    </div>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import LargeButton from '@/components/LargeButton'

// @todo: add volunteer name, 'Do you want to unfavorite Coach ${volunteer.name}'

export default {
  name: 'volunteer-unfavoriting-modal',
  components: {Modal, LargeButton},
  props: {
    closeModal: { type: Function, required: true },
    setIsFavorited: { type: Function, required: true},
  },
  methods: {
    unfavorite() {
      this.setIsFavorited(false)
      this.closeModal()
    }
  }
}
</script>
<style lang="scss" scoped>

.VolunteerUnfavoritingModal {
  @include flex-container(column);

  &-title {
    @include font-category('display-small');
  }

  &-buttons {
    margin-top: 28px;
    @include flex-container(row, space-evenly);
  }

  &-unfavoriteButton {
    background-color: $c-information-blue;
    color: white;
  }
}

</style>
