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
 // background-color: white;
  border-left-color: #F41717;
  border-bottom-color: #F41717;
  border-top-color: transparent;
  border-right-color: transparent;
}
.heart:active {
  background-color: #F41717;
}

.heart:before {
  position: absolute;
  border: 1px solid #000000;
  content: "";
  width: 18.6px;
  height: 18.6px;
  top: -50%;
  //left: -1px;
  left: -1px;
  background: inherit;
  border-radius: 50%;
  transform: rotate(-40deg);
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
 // border-color: inherit;
  background-color: #F44747;
  //top: 0;
}

.heart:after {
  position: absolute;
  border: 1px solid #000000;
  content: "";
  //top: -1px;
  top: 0.4px;
  right: -50%;
  width: 18.6px;
  height: 18.6px;
  background: inherit;
  border-radius: 50%;
  transform: rotate(-140deg);
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
  border-color: inherit;
  background-color: #F44747;
  border-top-color: inherit;
  border-right-color: inherit;
  //top: 0;
}

// html {
//   margin: 0;
//   padding: 0;
//   box-sizing: border-box;
// }

// body {
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 18.6px;
//   width: 20px;
// }

// .heart {
//   position: relative;
//   height: 18.6px;
//   width: 20px;
//   background-color: grey;
//   top: 50%;
//   left: 50%;
//   display: flex;
//   justify-content: center;
//   text-align: center;
//   border-radius: 0 0 0 1px;
//   transform: rotate(-45deg);
//   border: 1px solid #000000;
//   border-top-color: transparent;
//   border-right-color: transparent;
// }

// .heart:hover {
//   background-color: white;
//   border-left-color: #F41717;
//   border-bottom-color: #F41717;
//   border-top-color: transparent;
//   border-right-color: transparent;
// }
// .heart:active {
//   background-color: #F41717;
//   border-bottom-color: #F41717;
//   border-left-color: #F41717;
//   border-top-color: transparent;
//   border-right-color: transparent;
// }

// .heart:before {
//   position: absolute;
//   border: 1px solid #000000;
//   content: "";
//   width: 18px;
//   height: 16.7px;
//   top: -50%;
//   left: -1.3px;
//   background: inherit;
//   border-radius: 50%;
//   transform: rotate(45deg);
//   //border-top-color: green;
//   border-bottom-color: transparent;
//   border-right-color: transparent;
// }

//   .heart:hover:before {
//   border-top-color: #F41717 ;
//   border-right-color: #F41717 ;
//   border-bottom-color: transparent;
//   border-left-color: transparent;
//  // left: 0;
//   }

//   .heart:active:before {
//  // border-color: inherit;
//   background-color: #F44747;
//   //top: 0;
// }

// .heart:after {
//   position: absolute;
//   border: 1px solid #000000;
//   content: "";
//   //top: -1px;
//   top: 0.5px;
//   right: -45%;
//   width: 18px;
//   height: 16.7px;
//   background: inherit;
//   border-radius: 50%;
//   transform: rotate(45deg);
//   border-bottom-color: transparent;
//   border-left-color: transparent;
//   // border-top-color: yellow;
// }

// .heart:hover:after {
//   border-bottom-color: #F41717;
//   border-left-color: #F41717;
//   border-top-color: transparent;
//   border-right-color: transparent;
//   //top: 0;
// }

// .heart:active:after {
//   border-color: inherit;
//   background-color: #F44747;
//   border-top-color: inherit;
//   border-right-color: inherit;
//   //top: 0;
// }


</style>