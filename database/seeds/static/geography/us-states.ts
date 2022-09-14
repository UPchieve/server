import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function usStates(): Promise<NameToId> {
  const usStates = [
    {
      code: 'AL',
      name: 'Alabama',
    },
    {
      code: 'AK',
      name: 'Alaska',
    },
    {
      code: 'AR',
      name: 'Arkansas',
    },
    {
      code: 'AZ',
      name: 'Arizona',
    },
    {
      code: 'CA',
      name: 'California',
    },
    {
      code: 'CO',
      name: 'Colorado',
    },
    {
      code: 'CT',
      name: 'Connecticut',
    },
    {
      code: 'DE',
      name: 'Delaware',
    },
    {
      code: 'DC',
      name: 'District of Columbia',
    },
    {
      code: 'FL',
      name: 'Florida',
    },
    {
      code: 'GA',
      name: 'Georgia',
    },
    {
      code: 'HI',
      name: 'Hawaii',
    },
    {
      code: 'ID',
      name: 'Idaho',
    },
    {
      code: 'IL',
      name: 'Illinois',
    },
    {
      code: 'IN',
      name: 'Indiana',
    },
    {
      code: 'IA',
      name: 'Iowa',
    },
    {
      code: 'KS',
      name: 'Kansas',
    },
    {
      code: 'KY',
      name: 'Kentucky',
    },
    {
      code: 'LA',
      name: 'Louisiana',
    },
    {
      code: 'ME',
      name: 'Maine',
    },
    {
      code: 'MD',
      name: 'Maryland',
    },
    {
      code: 'MA',
      name: 'Massachusetts',
    },
    {
      code: 'MI',
      name: 'Michigan',
    },
    {
      code: 'MN',
      name: 'Minnesota',
    },
    {
      code: 'MS',
      name: 'Mississippi',
    },
    {
      code: 'MO',
      name: 'Missouri',
    },
    {
      code: 'MT',
      name: 'Montana',
    },
    {
      code: 'NE',
      name: 'Nebraska',
    },
    {
      code: 'NV',
      name: 'Nevada',
    },
    {
      code: 'NH',
      name: 'New Hampshire',
    },
    {
      code: 'NJ',
      name: 'New Jersey',
    },
    {
      code: 'NM',
      name: 'New Mexico',
    },
    {
      code: 'NY',
      name: 'New York',
    },
    {
      code: 'NC',
      name: 'North Carolina',
    },
    {
      code: 'ND',
      name: 'North Dakota',
    },
    {
      code: 'OH',
      name: 'Ohio',
    },
    {
      code: 'OK',
      name: 'Oklahoma',
    },
    {
      code: 'OR',
      name: 'Oregon',
    },
    {
      code: 'PA',
      name: 'Pennsylvania',
    },
    {
      code: 'RI',
      name: 'Rhode Island',
    },
    {
      code: 'SC',
      name: 'South Carolina',
    },
    {
      code: 'SD',
      name: 'South Dakota',
    },
    {
      code: 'TN',
      name: 'Tennessee',
    },
    {
      code: 'TX',
      name: 'Texas',
    },
    {
      code: 'UT',
      name: 'Utah',
    },
    {
      code: 'VT',
      name: 'Vermont',
    },
    {
      code: 'VA',
      name: 'Virginia',
    },
    {
      code: 'WA',
      name: 'Washington',
    },
    {
      code: 'WV',
      name: 'West Virginia',
    },
    {
      code: 'WI',
      name: 'Wisconsin',
    },
    {
      code: 'WY',
      name: 'Wyoming',
    },
    {
      code: 'PR',
      name: 'Puerto Rico',
    },
    {
      code: 'GU',
      name: 'Guam',
    },
    {
      code: 'VI',
      name: 'Virgin Islands',
    },
    {
      code: 'AS',
      name: 'American Samoa',
    },
    {
      code: 'BI',
      name: 'Bureau of Indian Education',
    },
  ]
  const temp: NameToId = {}
  for (const state of usStates) {
    temp[state.name] = await wrapInsert(
      'us_states',
      pgQueries.insertUsState.run,
      { ...state }
    )
  }
  temp['NA'] = await wrapInsert('us_states', pgQueries.insertUsState.run, {
    code: 'NA',
    name: 'NA',
  })
  return temp
}
