<template>
  <div>
    <component :class="favoritedStatus.class" v-bind:is="svg" v-on:click="changeFavoritedStatus"/>
  </div>
</template>

<script>
import HeartSVG from '@/assets/heart.svg'

export default {
  name: 'favoriting-toggle',
  components: { HeartSVG },
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
  async mounted() {
    if(this.toggleType === 'heart')
      this.svg = HeartSVG
  },
  methods: {
    changeFavoritedStatus() {
      this.isFavorited = !this.isFavorited
     // NetworkService.saveFavoritedStatus(this.isFavorited)
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