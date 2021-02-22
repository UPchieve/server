const countCerts = certifications => {
  let numCerts = 0
  for (const subject in certifications) {
    if (certifications[subject].passed) {
      numCerts += 1
    }
  }
  return numCerts
}

export default countCerts
