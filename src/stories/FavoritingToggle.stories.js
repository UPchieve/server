import FavoritingToggle from '../components/FavoritingToggle'

export default {
  title: 'Example/FavoritingToggle',
  component: FavoritingToggle
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { FavoritingToggle },
  template:
    '<favoriting-toggle v-bind="$props" />'
})

export const Vanilla = Template.bind({})
