<template>
  <modal :closeModal="closeModal">
    <div class="unfavoriting-modal">
    <header>
      <h1 class="unfavoriting-modal-title">
        Do you want to unfavorite Coach {{ volunteerName }}?  
      </h1>
    </header>
       
    <footer>
      <div class="unfavoriting-modal-buttons">
        <large-button @click.native="closeModal">Cancel</large-button>
        <large-button primary class="unfavoriting-modal-unfavorite-button" @click.native="unfavorite">Unfavorite</large-button>
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
  methods: {
    unfavorite() {
      this.$emit('unfavorite', false)
    }
  }
}
</script>
<style lang="scss" scoped>

.unfavoriting-modal {
  @include flex-container(column);

  &-title {
    @include font-category('display-small');
  }

  &-buttons {
    margin-top: 1em;
    @include flex-container(row, space-evenly);
  }

  &-unfavorite-button {
    background-color: $c-information-blue;
    color: white;
  }
}

</style>
