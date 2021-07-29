import { defineFeature, loadFeature } from 'jest-cucumber'

// links the step definition file to the feature file
const feature = loadFeature('./server/tests/features/example.feature')

defineFeature(feature, test => {
  test('Deposit money into bank', ({ given, when, then }) => {
    let bankAccount

    // @note: must use regex to access the placeholder values written out in 
    // the feature files
    given(/^I have \$(\d+) balance in my savings account$/, savingsBalance => {
      bankAccount = Number(savingsBalance)
    })

    when(/^I deposit \$(\d+)$/, amountToDeposit => {
      bankAccount += Number(amountToDeposit)
    })

    then(
      /^I should a balance of \$(\d+) in my savings account$/,
      savingsBalance => {
        expect(bankAccount).toEqual(Number(savingsBalance))
      }
    )
  })
})
