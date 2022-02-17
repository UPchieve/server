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
  background-color: grey;
//  border: 1px solid #000000;
  height: 16px;
  width: 16px;
  display: flex;
  justify-content: center;
  text-align: center;
  border-radius: 0 0 0 1px;
  transform: rotate(-45deg);
}

.heart:active {
 // visibility: initial;
  background-color: #F44747;
   width: 14px;
   height: 14px;
}

.heart:hover {
  background-color: #F41717
}
.heart::before {
  position: absolute;
 //border: 1px solid #000000;
  content: "";
  width: 100%;
  height: 120%;
  top: -55%;
  left: 0;
  background: inherit;
  border-radius: 50%;
}

.heart::after {
  position: absolute;
 // border: 1px solid #000000;
  content: "";
  top: 0;
  right: -55%;
  width: 120%;
  height: 100%;
  background: inherit;
  border-radius: 50%;
}
</style>