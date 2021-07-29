Feature: Inactivity Emails

  # blackout period is during 6/1 - 9/1
  Scenario: Volunteer has been inactive for 30 days during blackout period
    Given A volunteer reaches 30 days of inactivity
    When The current day is 6/1
    Then We do not send the 30 day email

  Scenario: Volunteer has been inactive for 60 days during blackout period
    Given A volunteer reaches 60 days of inactivity
    When The current day is 7/5
    Then We do not send the 60 day email

  Scenario: Volunteer has been inactive for 90 days during blackout period
    Given A volunteer reaches 90 days of inactivity
    When The current day is 9/1
    Then We do not send the 90 day email

  Scenario: Volunteer has been inactive for 30 days
    Given A volunteer reaches 30 days of inactivity
    When The current day is 9/2
    Then The volunteer receives a 30 day inactivity email as their first email

  Scenario: Volunteer has been inactive for 60 days
    Given A volunteer reaches 60 days of inactivity
    When The current day is 10/1
    Then The volunteer receives a 60 day inactivity email as their first email

  Scenario: Volunteer has been inactive since the start of the blackout period
    Given A volunteer reaches 90 days of inactivity
    When The current day is 9/1
    Then Volunteer does not receive any inactivity emails

  Scenario: Volunteer has been inactive since a day after the blackout period
    Given A volunteer reaches 90 days of inactivity
    When The current day is 9/2
    Then The volunteer receives a 90 day inactivity email as their first email

  Scenario: Volunteer recieves special inactivity email
    Given A volunteer has been inactive for 91 days
    When The current day is 9/2
    Then The volunteer receives a special summer inactivity email

  Scenario: Volunteer does not receive special inactivity email
    Given A volunteer has been inactive for 90 days
    When The current day is 9/2
    Then The volunteer does not receive a special summer inactivity email