<template>
  <div>
    <component :class="favoritedStatus.class" v-bind:is="svg" v-on:click="toggleFavoritedStatus"/>
    <volunteer-favoriting-modal
    v-if="showVolunteerFavoritingModal"
    :closeModal= "toggleVolunteerFavoritingModal"
    :setIsFavorited="setIsFavorited"
    />
  </div>
</template>

<script>
import HeartSVG from '@/assets/heart.svg'
import VolunteerFavoritingModal from '@/views/VolunteerFavoritingModel'

export default {
  name: 'favoriting-toggle',
  components: { HeartSVG, VolunteerFavoritingModal },
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
      showVolunteerFavoritingModal: false
    }
  },
  methods: {
    setIsFavorited(value) {
      this.isFavorited = value
     // NetworkService.saveFavoritedStatus(this.isFavorited)
    },
    toggleFavoritedStatus(){
      if(this.isFavorited){
        this.toggleVolunteerFavoritingModal
        return
      }
      this.setIsFavorited(true)
    },
    toggleVolunteerFavoritingModal() {
      this.showVolunteerFavoritingModal = !this.showVolunteerFavoritingModal
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
    fill: #F44747;
    transition: height 0.3s, width 0.3s;
  }

  &-favorited path {
    stroke: #F44747;
  } 

  &-favorited:active {
    height: 16px;
    width: 18px;
  }  
  
  &-favorited:hover path{
      stroke:#F41717;
      fill: #F41717;        
  }

  &-unfavorited {
    transition: height 0.3s, width 0.3s;
  }

  &-unfavorited:hover path{
    stroke:#F41717;
  }

  &-unfavorited:active {
    height: 16px;
    width: 18px;
  } 
}
</style>