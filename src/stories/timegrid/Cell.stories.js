import Cell from './Cell.vue'

export default {
  title: 'Example/Cell',
  component: Cell,
  argTypes: {
    backgroundColor: { control: 'color' },
    size: { control: { type: 'select', options: ['small', 'medium', 'large'] } }
  }
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { Cell },
  template: '<cell @onClick="onClick" v-bind="$props" />'
})

export const Selected = Template.bind({})
Primary.args = {
  selected: true,
  label: 'Cell'
}

export const Unselected = Template.bind({})
Secondary.args = {
  label: 'Cell'
}