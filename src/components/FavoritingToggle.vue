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
  height: 18.6px;
  width: 20px;
}

.heart {
  position: relative;
//  background-color: grey;
  border: 1px solid #000000;
  height: 16px;
  width: 16px;
  display: flex;
  justify-content: center;
  text-align: center;
  border-radius: 0 0 0 1px;
  transform: rotate(-45deg);
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 1;
}

// .heart:active {
//  // visibility: initial;
//   background-color: #F44747;
//    width: 14px;
//    height: 14px;
// }

.heart:hover {
  background-color: #F41717;
  border: transparent;
}

.heart:before {
  position: absolute;
  border: 1px solid #000000;
  content: "";
  width: 16px;
  height: 16px;
  top: -50%;
  left: -1px;
  background: inherit;
  border-radius: 50%;
  transform: rotate(-50deg);
  border-bottom-color: transparent;
  border-left-color: transparent;
  z-index: 0;

  // &:active {
  //   background-color: #F44747;
  //   width: 14px;
  //   height: 14px;
  // }
}

  .heart:hover:before {
  border-color: #F41717 ;
 // left: 0;
  }

.heart:after {
  position: absolute;
  border: 1px solid #000000;
  content: "";
  top: -1px;
  right: -50%;
  width: 16px;
  height: 16px;
  background: inherit;
  border-radius: 50%;
  transform: rotate(-130deg);
  border-top-color: transparent;
  border-right-color: transparent;
  z-index: 0;

  // &:active {
  //    background-color: #F44747;
  //   width: 14px;
  //   height: 14px;
  // }
}

.heart:hover:after {
  border-color: #F41717;
  //top: 0;
}
</style>