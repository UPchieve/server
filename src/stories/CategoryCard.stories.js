import CategoryCard from './CategoryCard.vue'

export default {
  title: 'Example/CategoryCard',
  component: CategoryCard
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { CategoryCard },
  template: '<CategoryCard @onClick="handleClick" v-bind="$props" />'
})

export const PrimaryCategory = Template.bind({})
PrimaryCard.args = {
  title: 'Math',
  svg: 'um',
  topic: 'Calculus'
}

export const SecondaryCategory = Template.bind({})
SecondaryCard.args= {
  title: 'Science',
  svg: 'um2',
  topic: 'Calculus II'
}