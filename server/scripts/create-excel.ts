import exceljs from 'exceljs'
import moment from 'moment'

const main = async function() {
  let exitCode = 0
  try {
    const start = moment().valueOf()
    console.log('START TIME: ', start)
    const workbook = new exceljs.stream.xlsx.WorkbookWriter({
      filename: '/home/fjorn/upchieve/subway/test.xlsx',
      useStyles: true
    })
    const sheetoptions = {
      pageSetup: {
        orientation: 'landscape',
        showGridLines: true,
        showRowColHeaders: true
      }
    } as Partial<exceljs.AddWorksheetOptions>
    const summarySheet = workbook.addWorksheet('Summary', sheetoptions)
    const dataSheet = workbook.addWorksheet('Data', sheetoptions)

    const columns = []
    for (let i=0; i<21; i+=1) {
      const col = {
        header: `COL ${i}`,
        key: `${i}`,
        width: 15
      }
      if (i % 6 === 2) {
        col['style'] = {
          font: { name: 'Comic Sans', bold: true },
          border: { 
            right: { 
              style: 'double', color: { argb:'FF000000' } 
            },
            bottom: {
              style: 'thick', color: { argb: 'FF00FF00' }
            }
          }
        }
      }
    }
    summarySheet.columns = columns

    const header = summarySheet.getRow(1)
    header.height = 42

    for (let i=0; i<1000; i+=1) {
      const row = {}
      for (let j=0; j<21; j+=1) {
        row[`${j}`] = `Row ${i} col ${j}`
      }
      summarySheet.addRow(row)
    }

    summarySheet.commit()
    // p sure the commit here will commit the worksheets too but included the worksheet commit manually
    // can commit rows/sheets in batches to minimize memory footprint
    await workbook.commit()
    const end = moment().valueOf()
    console.log('END TIME: ', end)
    console.log('DIFF: ', end - start)
  } catch (err) {
    exitCode = 1
    console.error('Unhandled error: ', err)
  } finally {
    process.exit(exitCode)
  }
}

main()