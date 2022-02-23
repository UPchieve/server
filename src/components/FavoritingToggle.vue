<template>
  <div>
    <component :class="favoritedStatus.class" v-bind:is="svg" v-on:click="changeFavoritedStatus"/>
  </div>
</template>

<script>
import FavoritedSVG from '@/assets/favorited.svg'
import UnfavoritedSVG from '@/assets/unfavorited.svg'

export default {
  name: 'favoriting-toggle',
  components: { FavoritedSVG, UnfavoritedSVG },
  props: {
    svg: {
      type: Object,
      required: true,
      default: UnfavoritedSVG
    },
    isFavorited: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    changeFavoritedStatus() {
      this.isFavorited = !this.isFavorited
     // this.favoritedStatus()
     // NetworkService.saveFavoritedStatus(this.isFavorited)
    }
  },
  computed: {
    favoritedStatus() {
      const status = {
        class: 'UnfavoritedToggle',
    }   

    if(this.isFavorited){
      status.class = 'FavoritedToggle',
      this.svg = FavoritedSVG
    }
    else {
      status.class = 'UnfavoritedToggle',
      this.svg = UnfavoritedSVG
    }
    return status
  }   
}
}
</script>

<style lang="scss">
.FavoritedToggle {
  fill: #F44747;
  height: 18.6px;
  width: 20px;

  &:hover {
    fill: #F41717;
  }

  &:active {
    height: 16px;
    width: 18px;
  }
}

.UnfavoritedToggle {
  height: 18.6px;
  width: 20px;

 &:hover {
   fill: white;
    stroke: #F41717
  }

  &:active {
    fill: none;
    height: 16px;
    width: 18px;
  }

}

</style>