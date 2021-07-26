import exceljs from 'exceljs'

const main = async function() {
  let exitCode = 0
  try {
    const workbook = new exceljs.Workbook()
    const sheetoptions = {
      pageSetup: {
        orientation: 'landscape',
        showGridLines: true,
        showRowColHeaders: true
      }
    } as Partial<exceljs.AddWorksheetOptions>
    const summarySheet = workbook.addWorksheet('Summary', sheetoptions)
    const dataSheet = workbook.addWorksheet('Data', sheetoptions)

    summarySheet.columns = [
      { header: 'Id', key: 'id', width: 10, style: { numFmt: '"£"#,##0.00;[Red]\-"£"#,##0.00' } },
      { 
        header: 'Name', key: 'name', width: 32,
        border: { 
          right: { 
            style: 'double', color: { argb:'00000000' } 
          },
          bottom: {
            style: 'thick', color: { argb: '00000000' }
          }
        },
        style: { font: { name: 'Comic Sans', bold: true } } 
      },
      { header: 'D.O.B.', key: 'DOB', width: 10, style: { numFmt: 'dd/mm/yyyy'} }
    ]

    const header = summarySheet.getRow(1)
    header.height = 42

    summarySheet.addRow({
      id: 24,
      name: 'Test',
      DOB: new Date()
    }, 'i')

    await workbook.xlsx.writeFile('/home/fjorn/upchieve/subway/test.xlsx');
  } catch (err) {
    exitCode = 1
    console.error('Unhandled error: ', err)
  } finally {
    process.exit(exitCode)
  }
}

main()