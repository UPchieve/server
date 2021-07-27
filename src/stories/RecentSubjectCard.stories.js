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
  svg: 'um',
  topic: 'Calculus',
  buttonText: 'Algebra 1'
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args= {
  title: 'Algebra 2',
  svg: 'um2',
  topic: 'Calculus II',
  buttonText: 'Algebra 2'
}