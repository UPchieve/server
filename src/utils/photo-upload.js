function checkIfPhotoIsAllowedType(file) {
  const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
  if (!allowedFormats.includes(file.type)) {
    throw new Error('We only allow .png, .jpeg, or .gif photos')
  }
}

function checkIfPhotoIsAllowedSize(file) {
  const tenMegaBytes = 10 * 1000000
  if (file.size > tenMegaBytes) {
    throw new Error(
      `This photo is too large. Please upload a photo less than 10mb.`
    )
  }
}

export async function validatePhoto(file) {
  checkIfPhotoIsAllowedType(file)

  checkIfPhotoIsAllowedSize(file)

  return file
}
