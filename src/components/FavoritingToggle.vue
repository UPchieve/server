<template>
  <div>
    <heart-icon v-if="toggleType === 'heart'" :class="favoritedStatus.class" v-on:click="toggleFavoritedStatus"/>
    <volunteer-unfavoriting-modal
      v-if="showVolunteerUnfavoritingModal"
      :closeModal="toggleVolunteerUnfavoritingModal"
      :setIsFavorited="setIsFavorited"
    />
    <favorited-list-full-modal
      v-if="showFavoritedListFullModal"
      :closeModal="toggleFavoritedListFullModal"
    />
  </div>
</template>

<script>
import HeartIcon from '@/assets/heart.svg'
import VolunteerUnfavoritingModal from '@/views/VolunteerUnfavoritingModal'
import FavoritedListFullModal from '@/views/FavoritedListFullModal'

export default {
  name: 'favoriting-toggle',
  components: { HeartIcon, VolunteerUnfavoritingModal, FavoritedListFullModal },
  props: {
    isFavorited: {
      type: Boolean,
      default: false
    },
    toggleType: {
      type: String,
      default: 'heart'
    },
  },
  data() {
    return {
      showVolunteerUnfavoritingModal: false,
      showFavoritedListFullModal: false,
      mockFavoriteVolunteerLimit: 20
    }
  },
  methods: {
    setIsFavorited(value) {
      this.isFavorited = value
      this.mockUpdateVolunteerFavoritedStatus(value)
      //NetworkService.updateVolunteerFavoritedStatus()
    },
    toggleFavoritedStatus(){
       if(this.isFavorited){
         this.toggleVolunteerUnfavoritingModal
         return
       }
      //  else
      // // hit get endpoint to check how many remaining volunteers student can favorite
      // // if less than < max num 
      // // do the following 
       if(this.mockGetRemainingVolunteers>0)
         this.setIsFavorited(true)
       else
        this.toggleFavoritedListFullModal()
    },
    toggleVolunteerUnfavoritingModal() {
      this.showVolunteerUnfavoritingModal = !this.showVolunteerUnfavoritingModal
    },
    toggleFavoritedListFullModal() {
      this.showFavoritedListFullModal = !this.showFavoritedListFullModal
    },
    mockUpdateVolunteerFavoritedStatus(value){
      return value
    },
    mockGetRemainingVolunteers(){
      const remaining = 5
      return remaining
    }
  },
  computed: {
    favoritedStatus() {
      const status = {
        class: 'heart-icon',
      }   

    if(this.isFavorited){
      status.class += '-favorited'
    }
    else {
      status.class += '-unfavorited'
    }
    return status
  }   
}
}
</script>

<style lang="scss">
.heart-icon {  
  &-favorited {
    fill: $c-shadow-warn;
    transition: all 0.3s ease-in-out;

    & path {
    stroke: $c-shadow-warn;
    } 

    &:active {
    transform: scale(0.9);
    }  
  
    &:hover path{
      stroke: $c-active-heart;
      fill: $c-active-heart;        
    }
  }

  &-unfavorited {
    transition: all 0.3s ease-in-out;

    &:hover path{
      stroke: $c-active-heart;
    }

    &:active {
      transform: scale(0.9);
    }
  } 
}
</style>