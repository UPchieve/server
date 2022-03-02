<template>
  <div>
    <component :class="favoritedStatus.class" v-bind:is="svg" v-on:click="toggleFavoritedStatus"/>
    <volunteer-favoriting-modal
      v-if="showVolunteerUnfavoritingModal"
      :closeModal= "toggleVolunteerUnfavoritingModal"
      :setIsFavorited="setIsFavorited"
    />
    <favorited-list-full-modal
      v-if="showFavoritedListFullModal"
      :closeModal= "toggleFavoritedListFullModal"
    />
  </div>
</template>

<script>
import HeartSVG from '@/assets/heart.svg'
import VolunteerUnfavoritingModal from '@/views/VolunteerUnfavoritingModal'
import FavoritedListFullModal from '@/views/FavoritedListFullModal'

export default {
  name: 'favoriting-toggle',
  components: { HeartSVG, VolunteerUnfavoritingModal, FavoritedListFullModal },
  async mounted() {
    if(this.toggleType === 'heart')
      this.svg = HeartSVG
  },
  props: {
    svg: {
      type: Object,
      required: true
    },
    isFavorited: {
      type: Boolean,
      default: false
    },
    toggleType: {
      type: String,
      default: 'heart'
    },
    closeModal: { 
      type: Function, 
      required: true 
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
       else
      // hit get endpoint to check how many remaining volunteers student can favorite
      // if less than < max num 
      // do the following 
      if(this.mockGetRemainingVolunteers>0)
        this.setIsFavorited(true)
      else
       this.toggleFavoritedListFullModal
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
      const favorited = 15
     return this.mockFavoriteVolunteerLimit - favorited
    }
  },
  computed: {
    favoritedStatus() {
      const status = {
        class: 'HeartToggle',
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
.HeartToggle {  
  height: 18.6px;
  width: 20px;

  &-favorited {
    fill: $c-shadow-warn;
    transition: height 0.3s, width 0.3s;
  }

  &-favorited path {
    stroke: $c-shadow-warn;
  } 

  &-favorited:active {
    height: 16px;
    width: 18px;
  }  
  
  &-favorited:hover path{
      stroke: $c-active;
      fill: $c-active;        
  }

  &-unfavorited {
    transition: height 0.3s, width 0.3s;
  }

  &-unfavorited:hover path{
    stroke: $c-active;
  }

  &-unfavorited:active {
    height: 16px;
    width: 18px;
  } 
}
</style>