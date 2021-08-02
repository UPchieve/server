import RecentSubjectCard from '../views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'

export default {
  title: 'Example/RecentSubjectCard',
  component: RecentSubjectCard
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { RecentSubjectCard },
  template: '<recent-subject-card @onClick="handleClick" v-bind="$props" />'
})

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  title: 'Algebra 1',
  topic: 'Calculus'
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  title: 'Algebra 2',
  disableSubjectCard: true,
  showArrow: false
}
