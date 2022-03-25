import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function requiredEmailDomainsReal(
  vpoIds: NameToId
): Promise<NameToId> {
  const domains = [
    {
      id: getDbUlid(),
      domain: 'upchieve.org',
      volunteerPartnerOrgId: vpoIds['example'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'atlassian.com',
      volunteerPartnerOrgId: vpoIds['atlassian'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'pwc.com',
      volunteerPartnerOrgId: vpoIds['pwc'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'mizuhogroup.com',
      volunteerPartnerOrgId: vpoIds['mizuho'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'mizuhocbus.com',
      volunteerPartnerOrgId: vpoIds['mizuho'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'us.mizuho-sc.com',
      volunteerPartnerOrgId: vpoIds['mizuho'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'mhtny.com',
      volunteerPartnerOrgId: vpoIds['mizuho'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'gs.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'ghsl.cn',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'gsgh.cn',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'qkfutures.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'ayco.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'archongroup.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'avelomortgage.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'gsrjl.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'ny.email.gs.com',
      volunteerPartnerOrgId: vpoIds['goldman-sachs'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'att.com',
      volunteerPartnerOrgId: vpoIds['att'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cigna.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'healthspring.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'careallies.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'gulfquest.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'alegiscare.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cignavoluntary.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'qualcareinc.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'qual-lynx.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'sagamorehn.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cignabehavioral.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cignainsurance.co.uk',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'lmchealthplans.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cignafinans.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'bravohealth.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cignakorea.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cignakorea.co.kr',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'cingattk.in',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'express-scripts.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'evicore.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'freedomfertility.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'mymatrixx.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'accredohealth.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'curascript.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'accredo.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'medco.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'novafactor.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'healthbridgeinc.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'hemophiliahealth.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'accredotx.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'proherant.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'namedco.msx.medcohealth.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'carecontinuum.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'manipalcigna.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'ascenthealthservices.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'linafs.co.kr',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'verity340b.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'careallies.net',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'evernorth.com',
      volunteerPartnerOrgId: vpoIds['cigna'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'fox.com',
      volunteerPartnerOrgId: vpoIds['fox'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'foxnews.com',
      volunteerPartnerOrgId: vpoIds['fox'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'foxtv.com',
      volunteerPartnerOrgId: vpoIds['fox'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'foxsports.com',
      volunteerPartnerOrgId: vpoIds['fox'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'foxbusiness.com',
      volunteerPartnerOrgId: vpoIds['fox'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'loomissayles.com',
      volunteerPartnerOrgId: vpoIds['loomis-sayles'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'twilio.com',
      volunteerPartnerOrgId: vpoIds['twilio'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'santander.us',
      volunteerPartnerOrgId: vpoIds['santander'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'santanderinvestments.com',
      volunteerPartnerOrgId: vpoIds['santander'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'dell.com',
      volunteerPartnerOrgId: vpoIds['dell'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'newrelic.com',
      volunteerPartnerOrgId: vpoIds['newrelic'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'synopsys.com',
      volunteerPartnerOrgId: vpoIds['synopsys'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'farmersinsurance.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'contractor.farmersinsurance.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: '21st.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'bristolwest.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'farmershawaii.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'hpcs.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'foremost.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'kraftlake.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'westernstarinsurance.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'hiinsconsultants.com',
      volunteerPartnerOrgId: vpoIds['farmers'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'nvidia.com',
      volunteerPartnerOrgId: vpoIds['nvidia'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'bsci.com',
      volunteerPartnerOrgId: vpoIds['boston-scientific'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'one.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'verizonwireless.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'verizonmedia.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'verizonconnect.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'verizon.net',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'vzw.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'au.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'de.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'uk.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'ph.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'intl.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'ie.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
    {
      id: getDbUlid(),
      domain: 'in.verizon.com',
      volunteerPartnerOrgId: vpoIds['somos'] as string,
    },
  ]
  const temp: NameToId = {}
  for (const domain of domains) {
    temp[domain.domain] = await wrapInsert(
      'required_email_domains',
      pgQueries.insertRequiredEmailDomain.run,
      { ...domain }
    )
  }
  return temp
}
