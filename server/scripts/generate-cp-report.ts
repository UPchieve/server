// Trey's version
import * as db from '../db'
import { getAnalyticsReport } from '../services/ReportService'

async function main() {
  console.log('BEGIN generating report...')
  let exitCode = 0
  try {
    await db.connect()
    const result = await getAnalyticsReport({
      // @TODO modify me as needed
      partnerOrg: 'csumb',
      startDate: '01-01-2023',
      endDate: '12-14-2023',
    })
    console.log('The downloaded report path: ', result)
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await db.closeClient()
    console.log('END generating report.')
    process.exit(exitCode)
  }
}

main()
