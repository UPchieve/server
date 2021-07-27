import SubjectCard from '../views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'

export default {
  title: 'Example/RecentSubjectCard',
  component: SubjectCard
}

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { SubjectCard },
  template: '<subject-card @onClick="handleClick" v-bind="$props" />'
})

export const PrimaryCard = Template.bind({})
PrimaryCard.args = {
  title: 'Algebra 1',
  svg: 'um',
  topic: 'Calculus',
  buttonText: 'Algebra 1'
}

export const SecondaryCard = Template.bind({})
SecondaryCard.args= {
  title: 'Algebra 2',
  svg: 'um2',
  topic: 'Calculus II',
  buttonText: 'Algebra 2'
}