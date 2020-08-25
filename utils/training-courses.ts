import { find, chain } from "lodash";

interface TrainingCourse {
  name: string;
  courseKey: string;
  description: string;
  quizKey: string;
  modules: TrainingModule[];
}

interface TrainingModule {
  name: string;
  moduleKey: string;
  materials: TrainingMaterial[];
}

enum MaterialType {
  VIDEO = 'video',
  SLIDESHOW = 'slideshow',
  DOCUMENT = 'document',
  LINK = 'link',
  RESOURCES = 'resources'
}

interface TrainingMaterial {
  name: string;
  description?: string;
  materialKey: string;
  isRequired: boolean;
  type: MaterialType;
  resourceId?: string;
  linkUrl?: string;
  links?: TrainingMaterialLink[];
}

interface TrainingMaterialLink {
  displayName: string;
  url: string;
}

export const getCourse = (courseKey: string): TrainingCourse => {
  return find(courses, { courseKey });
}

const getRequiredMaterials = (courseKey: string): string[] => {
  const course: TrainingCourse = getCourse(courseKey);
  return chain(course.modules)
    .map('materials')
    .flatten()
    .filter('isRequired')
    .map('materialKey')
    .value();
}

export const getProgress = (courseKey: string, userCompleted: string[]): number => {
  const course = getCourse(courseKey);
  const requiredMaterials = getRequiredMaterials(courseKey);
  const completedMaterials = requiredMaterials.filter(mat => userCompleted.includes(mat));
  const fraction = completedMaterials.length / requiredMaterials.length;
  return Math.floor(fraction * 100);
}

export const courses: TrainingCourse[] = [
  {
    name: "UPchieve 101",
    courseKey: "upchieve101",
    description:
      "UPchieve101 is a required training in order to be an Academic Coach. Please complete each Module before completeing the quiz at the bottom.",
    quizKey: "upchieve101",
    modules: [
      {
        name: "Module 1",
        moduleKey: "4k90tg",
        materials: [
          {
            name: "Intro Video",
            description: "Here's a video about editing your phone number",
            materialKey: "31rgp3",
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: "450241431"
          },
          {
            name: "Coach Guide",
            materialKey: "1s3654",
            type: MaterialType.DOCUMENT,
            isRequired: true,
            resourceId:
              "1lFye8o9zM2b3desil8EUaACAxxfqzBBlYqPmPy_Ro24"
          },
          {
            name: "How to complete a session on UPchieve",
            description: "Material description",
            materialKey: "42j392",
            type: MaterialType.DOCUMENT,
            isRequired: true,
            resourceId:
              "1lFye8o9zM2b3desil8EUaACAxxfqzBBlYqPmPy_Ro24"
          },
          {
            name: "About our students",
            description: "Material description",
            materialKey: "413g67",
            type: MaterialType.SLIDESHOW,
            isRequired: false,
            resourceId:
              "2PACX-1vR9dTPucpNYnYWBTi0bGBaJKt4YBuKkO5LSpZpc-JjLqg0SIAw6os4XHWFyCAXrOnQfCGIEw925DRGr"
          },
          {
            name: "Donate to UPchieve",
            description: "Click this link to donate",
            materialKey: "6a3231",
            type: MaterialType.LINK,
            isRequired: true,
            linkUrl: "https://upchieve.org/donate"
          },
          {
            name: "More resources",
            description: "Here are more resources",
            materialKey: "90d731",
            type: MaterialType.RESOURCES,
            isRequired: false,
            links: [
              {
                displayName: "Differential equation introduction",
                url: "https://www.youtube.com/watch?v=6o7b9yyhH7k"
              },
              {
                displayName: "Implicit Bias",
                url: "https://www.youtube.com/watch?v=kKHSJHkPeLY"
              }
            ]
          }
        ]
      },
      {
        name: "Module 2",
        moduleKey: "gfw567",
        materials: [
          {
            name: "Intro Video",
            materialKey: "412g45",
            type: MaterialType.VIDEO,
            isRequired: true,
            resourceId: "450241431"
          },
          {
            name: "Coach Guide",
            description: "Material description",
            materialKey: "vrwv5g",
            type: MaterialType.DOCUMENT,
            isRequired: true,
            resourceId:
              "1lFye8o9zM2b3desil8EUaACAxxfqzBBlYqPmPy_Ro24"
          },
          {
            name: "How to complete a session on UPchieve",
            materialKey: "5ggwf3",
            type: MaterialType.DOCUMENT,
            isRequired: true,
            resourceId:
              "1lFye8o9zM2b3desil8EUaACAxxfqzBBlYqPmPy_Ro24"
          },
          {
            name: "About our students",
            description: "Material description",
            materialKey: "jtyeh3",
            type: MaterialType.SLIDESHOW,
            isRequired: false,
            resourceId: "2PACX-1vR9dTPucpNYnYWBTi0bGBaJKt4YBuKkO5LSpZpc-JjLqg0SIAw6os4XHWFyCAXrOnQfCGIEw925DRGr"
          }
        ]
      }
    ]
  }
];