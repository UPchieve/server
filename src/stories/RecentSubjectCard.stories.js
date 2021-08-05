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

//default state 
export const DefaultCard = Template.bind({})
DefaultCard.args = {
  title: 'Algebra 1'
}

export const HoveredCard = Template.bind({})
HoveredCard.args = {
  title: 'Algebra 2',
  // showArrow: true,
  // hoveredSubjectCard = true
}
//disabled state
export const PressedCard = Template.bind({})
PressedCard.args = {
  title: 'Calc 1',
 // activeSubjectCard: true
}

export const DisabledCard = Template.bind({})
DisabledCard.args = {
  title: 'Calc 2',
  disableSubjectCard: true
}
