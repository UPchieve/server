import RecentSubjectCard from '../views/DashboardView/StudentDashboard/SubjectSelection/RecentSubjectCard.vue'
import MathSVG from '../../src/assets/subject_icons/math.svg'

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
  svg: MathSVG
}

export const SecondaryButton = Template.bind({})
SecondaryButton.args = {
  title: 'Algebra 2',
  disableSubjectCard: true,
  showArrow: false,
  svg: MathSVG
}
