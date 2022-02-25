<template>
  <modal :closeModal="closeModal">
    <div class="VolunteerFavoritingModal">
    <header>
      <h1 class="VolunteerFavoritingModal-title">
        Do you want to unfavorite this coach?  
      </h1>
    </header>

    <separator />
       
    <footer>
      <div class="VolunteerFavoritingModal-buttons">
        <large-button @click.native="closeModal">Cancel</large-button>
        <large-button primary class="VolunteerFavoritingModal-unfavoriteButton" @click.native="unfavorite">Unfavorite</large-button>
      </div>
    </footer>
    </div>
  </modal>
</template>

<script>
import Modal from '@/components/Modal'
import LargeButton from '@/components/LargeButton'
import Separator from '@/components/Separator'

// @todo: add volunteer name, 'Do you want to unfavorite Coach ${volunteer.name}'

export default {
  name: 'volunteer-favoriting-modal',
  components: {Modal, LargeButton,Separator},
  props: {
    closeModal: { type: Function, required: true },
    setAsUnfavorited: { type: Function, required: true},
  },
  methods: {
    unfavorite() {
      this.setAsUnfavorited(true)
      this.closeModal()
    }
  }
}
</script>
<style lang="scss" scoped>

.VolunteerFavoritingModal {
  @include flex-container(column);

  &-title {
    @include font-category('display-small');
  }

  &-buttons {
    margin-top: 43px;
    @include flex-container(row, space-evenly);
  }

  &-unfavoriteButton {
    background-color: #1855D1;
    color: white;
  }
}

</style>
