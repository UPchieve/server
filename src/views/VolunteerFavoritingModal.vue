<template>
 <modal :closeModal="closeModal">
<div class="volunteer-favoriting-modal">
   <header>
        <h1>
          Do you want to unfavorite this coach?  
        </h1>
      </header>

       <separator />
       
       <footer class="volunteer-favoriting-modal__footer">
        <div class="web-notifications-modal__buttons">
          <large-button @click.native="closeModal">Cancel</large-button>
          <large-button primary>Unfavorite</large-button>
        </div>
      </footer>
            </div>
 </modal>
</template>

<script>
import Modal from '@/components/Modal'
import LargeButton from '@/components/LargeButton'
import Separator from '@/components/Separator'
// @todo: 'Do you want to unfavorite Coach ${volunteer.name}'

export default {
  name: 'VolunteerFavoritingModal',
  components: {Modal, LargeButton,Separator},
  props: {
    closeModal: { type: Function, required: true },
  },
  methods: {
    unfavorite() {
      this.setAsUnfavorited(true)
      this.closeModal()
    }
  }
}
</script>
