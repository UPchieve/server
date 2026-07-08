import type {
  AllSubjectsWithTopicsPublic,
  SubjectWithTopicPublic,
  TopicPublic,
  TrainingItemPublic,
  TrainingItemWithOrderPublic,
  TrainingPerTopicPublic,
  TrainingRowPublic,
  TrainingViewPublic,
} from '../contracts/subjects'
import type {
  AllSubjectsWithTopics,
  GetTopicsResult,
  SubjectWithTopic,
  TrainingItem,
  TrainingItemWithOrder,
  TrainingPerTopic,
  TrainingRow,
  TrainingView,
} from '../models/Subjects'

function toSubjectWithTopicPublic(
  subject: SubjectWithTopic
): SubjectWithTopicPublic {
  return {
    name: subject.name,
    id: subject.id,
    displayOrder: subject.displayOrder,
    displayName: subject.displayName,
    active: subject.active,
    topicId: subject.topicId,
    topicName: subject.topicName,
    topicDisplayName: subject.topicDisplayName,
    topicDashboardOrder: subject.topicDashboardOrder,
    isComputedUnlock: subject.isComputedUnlock,
    topicIconLink: subject.topicIconLink,
    topicColor: subject.topicColor,
  }
}

export function toAllSubjectsPublic(
  subjects: AllSubjectsWithTopics
): AllSubjectsWithTopicsPublic {
  return Object.fromEntries(
    Object.entries(subjects).map(([subjectKey, subject]) => [
      subjectKey,
      toSubjectWithTopicPublic(subject),
    ])
  )
}

function toTrainingItemPublic(item: TrainingItem): TrainingItemPublic {
  return {
    key: item.key,
    displayName: item.displayName,
    active: item.active,
  }
}

function toTrainingItemWithOrderPublic(
  item: TrainingItemWithOrder
): TrainingItemWithOrderPublic {
  return {
    ...toTrainingItemPublic(item),
    order: item.order,
  }
}

function toTrainingRowPublic(row: TrainingRow): TrainingRowPublic {
  return {
    ...toTrainingItemWithOrderPublic(row),
    subjectsIncluded: row.subjectsIncluded.map(toTrainingItemWithOrderPublic),
  }
}

function toTrainingPerTopicPublic(
  topic: TrainingPerTopic
): TrainingPerTopicPublic {
  return {
    training: topic.training.map(toTrainingItemPublic),
    certifications: topic.certifications.map(toTrainingRowPublic),
    additionalSubjects: topic.additionalSubjects.map(toTrainingRowPublic),
    computedSubjects: topic.computedSubjects?.map(toTrainingRowPublic),
  }
}

// TODO: Refactor TrainingView to use a `topics` property instead of
// dynamic topic-name keys. This will simplify typing and public mapping.
export function toTrainingPublic(
  trainingView: TrainingView
): TrainingViewPublic {
  const publicTrainingView: Record<string, TrainingPerTopicPublic> = {}

  for (const [topicName, topic] of Object.entries(trainingView)) {
    if (topicName === 'subjectTypes') continue
    publicTrainingView[topicName] = toTrainingPerTopicPublic(
      topic as TrainingPerTopic
    )
  }

  return {
    subjectTypes: trainingView.subjectTypes.map(toTrainingItemWithOrderPublic),
    ...publicTrainingView,
  } as TrainingViewPublic
}

export function toTopicPublic(topic: GetTopicsResult): TopicPublic {
  return {
    id: topic.id,
    name: topic.name,
    displayName: topic.displayName,
    iconLink: topic?.iconLink,
    dashboardOrder: topic.dashboardOrder,
    trainingOrder: topic.trainingOrder,
  }
}
