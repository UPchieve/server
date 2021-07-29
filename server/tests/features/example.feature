Feature: Depositing money

Scenario: Deposit money into bank
    Given I have $400 balance in my savings account
    When I deposit $150
    Then I should a balance of $550 in my savings account