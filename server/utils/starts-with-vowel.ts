function startsWithVowel(word: string) {
  return /[AEIOUaeiou]/i.test(word[0])
}

export default startsWithVowel
