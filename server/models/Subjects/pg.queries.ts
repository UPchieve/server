/** Types generated for queries found in "server/models/Subjects/subjects.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetSubjectAndTopic' parameters type */
export interface IGetSubjectAndTopicParams {
  subject: string;
  topic: string;
}

/** 'GetSubjectAndTopic' return type */
export interface IGetSubjectAndTopicResult {
  subjectDisplayName: string;
  subjectName: string;
  topicDisplayName: string;
  topicName: string;
}

/** 'GetSubjectAndTopic' query type */
export interface IGetSubjectAndTopicQuery {
  params: IGetSubjectAndTopicParams;
  result: IGetSubjectAndTopicResult;
}

const getSubjectAndTopicIR: any = {"name":"getSubjectAndTopic","params":[{"name":"subject","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":295,"b":302,"line":11,"col":21}]}},{"name":"topic","required":true,"transform":{"type":"scalar"},"codeRefs":{"used":[{"a":327,"b":332,"line":12,"col":23}]}}],"usedParamSet":{"subject":true,"topic":true},"statement":{"body":"SELECT\n    subjects.name AS subject_name,\n    subjects.display_name AS subject_display_name,\n    topics.name AS topic_name,\n    topics.display_name AS topic_display_name\nFROM\n    subjects\n    JOIN topics ON subjects.topic_id = topics.id\nWHERE\n    subjects.name = :subject!\n    AND topics.name = :topic!","loc":{"a":31,"b":332,"line":2,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *     subjects.name AS subject_name,
 *     subjects.display_name AS subject_display_name,
 *     topics.name AS topic_name,
 *     topics.display_name AS topic_display_name
 * FROM
 *     subjects
 *     JOIN topics ON subjects.topic_id = topics.id
 * WHERE
 *     subjects.name = :subject!
 *     AND topics.name = :topic!
 * ```
 */
export const getSubjectAndTopic = new PreparedQuery<IGetSubjectAndTopicParams,IGetSubjectAndTopicResult>(getSubjectAndTopicIR);


