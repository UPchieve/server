<template>
    <li
      class="chip-item"
    >
      {{ chipContent }}
    </li>
</template>

<script>

export default {
  name: 'ChipItem',
  props: {
    chipContent: String
  }
}
</script>

<style lang="scss" scoped>

.chip-item {
  margin-right: 1em;
  padding: 0.5em 1em;
  border-radius: 100px;
  margin-top: 1em;
  font-size: 12px;
  color: #000;
  background-color: #fff;

  border-radius: 30px;
  border: 1px solid #D8DEE6;
}
</style>
