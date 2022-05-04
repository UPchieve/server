function checkIfPhotoIsAllowedType(file) {
  const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
  console.log(`FILE TYPE: ${file.type}`)
  if (!allowedFormats.includes(file.type)) {
    throw new Error('We only allow .png, .jpeg, or .gif photos')
  }
}

function checkIfPhotoIsAllowedSize(file) {
  const tenMegaBytes = 10 * 1000000
  console.log(`FILE SIZE: ${file.size}`)
  if (file.size > tenMegaBytes) {
    throw new Error(
      `This photo is too large. Please upload a photo less than 10mb.`
    )
  }
}

export function validatePhoto(file) {
  checkIfPhotoIsAllowedType(file)

  checkIfPhotoIsAllowedSize(file)

  return file
}
