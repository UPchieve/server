import exceljs from 'exceljs'
import moment from 'moment'

const main = async function() {
  let exitCode = 0
  try {
    const start = moment().valueOf()
    console.log('START TIME: ', start)
  
    // Use exceljs stream system to be capable of committing rows as you populate
    // and style them to minimize your memory footprint
    const workbook = new exceljs.stream.xlsx.WorkbookWriter({
      filename: '/home/fjorn/upchieve/subway/test.xlsx',
      useStyles: true  // include this option to apply styling to streams
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
      } as exceljs.Column
      if (i % 6 === 2) {
        col.style = {
          // apply border/fill etc in style object
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
      columns.push(col)
    }
    summarySheet.columns = columns

    const header = summarySheet.getRow(1)
    header.height = 42

    for (let i=0; i<1000; i+=1) {
      const row = {}
      for (let j=0; j<21; j+=1) {
        row[`${j}`] = `Row ${i} col ${j}`
      }
      summarySheet.addRow(row, 'i')
    }

    // you can commit rows in batches to minimize memory footprint
    // i.e. const row = sheet.addRow(); row.commit()
    // however once a sheet is committed you can no longer add rows
    summarySheet.commit()
    await workbook.commit()  // will commit unused data sheet

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