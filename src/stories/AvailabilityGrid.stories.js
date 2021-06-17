import AvailabilityGrid from '../components/AvailabilityGrid'

export default {
  title: 'Availability/AvailabilityGrid',
  component: AvailabilityGrid
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { AvailabilityGrid },
  template:
    '<AvailabilityGrid v-bind="$props">AvailabilityGrid</AvailabilityGrid>'
})

const availabilityTime = {
  '12a': true,
  '1a': true,
  '2a': true,
  '3a': false,
  '4a': false,
  '5a': false,
  '6a': false,
  '7a': false,
  '8a': true,
  '9a': false,
  '10a': false,
  '11a': false,
  '12p': false,
  '1p': false,
  '2p': false,
  '3p': false,
  '4p': false,
  '5p': false,
  '6p': false,
  '7p': true,
  '8p': true,
  '9p': true,
  '10p': true,
  '11p': true
}
const availability = {
  Sunday: availabilityTime,
  Monday: availabilityTime,
  Tuesday: availabilityTime,
  Wednesday: availabilityTime,
  Thursday: availabilityTime,
  Friday: availabilityTime,
  Saturday: availabilityTime
}

const waitTimes = {
  '12a': 5 * 60 * 1000,
  '1a': 5 * 60 * 1000,
  '2a': 5 * 60 * 1000,
  '3a': 10 * 60 * 1000,
  '4a': 10 * 60 * 1000,
  '5a': 10 * 60 * 1000,
  '6a': 10 * 60 * 1000,
  '7a': 10 * 60 * 1000,
  '8a': 15 * 60 * 1000,
  '9a': 10 * 60 * 1000,
  '10a': 10 * 60 * 1000,
  '11a': 10 * 60 * 1000,
  '12p': 20 * 60 * 1000,
  '1p': 10 * 60 * 1000,
  '2p': 10 * 60 * 1000,
  '3p': 10 * 60 * 1000,
  '4p': 10 * 60 * 1000,
  '5p': 10 * 60 * 1000,
  '6p': 10 * 60 * 1000,
  '7p': 5 * 60 * 1000,
  '8p': 5 * 60 * 1000,
  '9p': 5 * 60 * 1000,
  '10p': 5 * 60 * 1000,
  '11p': 5 * 60 * 1000
}
const wait = {
  Sunday: waitTimes,
  Monday: waitTimes,
  Tuesday: waitTimes,
  Wednesday: waitTimes,
  Thursday: waitTimes,
  Friday: waitTimes,
  Saturday: waitTimes
}

export const Vanilla = Template.bind({})
Vanilla.args = {
  availability: availability,
  waitTimes: wait
}
