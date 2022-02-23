<template>
  <div class="heart">

  </div>
</template>

<script>
export default {
  name: 'favoriting-toggle'
}
</script>

<style lang="scss">

html {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart {
  position: relative;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  text-align: center;
  border-radius: 0 0 0 1px;
  transform: rotate(-45deg);
  border: 1px solid #000000;
  border-top-color: transparent;
  border-right-color: transparent;
 }

.heart:hover {
  border-left-color: #F41717;
  border-bottom-color: #F41717;
}
.heart:active {
  background: linear-gradient(45deg, #F41717 50%, white 0%); //#F41717; 
  border-top-color: white;
  border-right-color: white;
  height: 18px;
  width: 18px;
}

.heart:before {
  position: absolute;
  border: 1px solid #000000;
  content: "";
  width: 18.6px;
  height: 18.6px;
  top: -48%;
  //left: -1px;
  left: -1px;
  background-color: transparent;
  border-radius: 50%;
  transform: rotate(-41deg);
  border-bottom-color: transparent;
  border-left-color: transparent;
}

  .heart:hover:before {
  border-top-color: #F41717 ;
  border-right-color: #F41717 ;
  border-bottom-color: transparent;
  border-left-color: transparent;
 // left: 0;
  }

  .heart:active:before {
  background-color: #F44747;
  height: 16px;
  width: 16px;
  //top: 0;
}

.heart:after {
  position: absolute;
  border: 1px solid #000000;
  content: "";
  //top: -1px;
  top: 0.5px;
  right: -48%;
  width: 18.6px;
  height: 18.6px;
  background: transparent;
  border-radius: 50%;
  transform: rotate(-139deg);
  border-top-color: transparent;
  border-right-color: transparent;
}

.heart:hover:after {
  border-bottom-color: #F41717;
  border-left-color: #F41717;
  border-top-color: transparent;
  border-right-color: transparent;
  //top: 0;
}

.heart:active:after {
  border-color: #F44747;
  background-color: #F44747;
  height: 16px;
  width: 16px;
  top: 1px;
}

</style>