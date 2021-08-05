Feature: Inactivity Emails

  Rule: Volunteers should not receive inactive 30, 60, 90 day emails during 6/1 - 9/1
    # blackout period is during 6/1 - 9/1
    Scenario: Volunteer has been inactive for 30 days during the blackout period
      Given A volunteer's last activity was on 5/2
      When The current day is 6/1
      Then We do not send the 30 inactivity day email

    Scenario: Volunteer has been inactive for 60 days during the blackout period
      Given A volunteer's last activity was on 5/6
      When The current day is 7/5
      Then We do not send the 60 inactivity day email

    Scenario: Volunteer has been inactive for 90 days during the blackout period
      Given A volunteer's last activity was on 6/3
      When The current day is 9/1
      Then We do not send the 90 inactivity day email

  Rule: Inactivity emails resume as normal on 9/2
    Scenario: Volunteer has been inactive for 30 days
      Given A volunteer's last activity was on 8/3
      When The current day is 9/2
      Then The volunteer receives a 30 day inactivity email as their first email

    Scenario: Volunteer has been inactive for 60 days
      Given A volunteer's last activity was on 8/2
      When The current day is 10/1
      Then The volunteer receives a 60 day inactivity email as their first email

    Scenario: Volunteer has been inactive since the start of the blackout period
      Given A volunteer's last activity was on 6/3
      When The current day is 9/1
      Then Volunteer does not receive any of the inactivity emails

    Scenario: Volunteer has been inactive for 90 days since a day after the start of the blackout period
      Given A volunteer's last activity was on 6/4
      When The current day is 9/2
      Then The volunteer receives a 90 day inactivity email as their first email

  Rule: On 9/2, any volunteer who has been inactive for 91+ days will get a special email about summer inactivity
    Scenario: Volunteer recieves special inactivity email
      Given A volunteer's last activity was on 6/3
      When The current day is 9/2
      Then The volunteer receives a special summer inactivity email
      And The volunteer will have all of their availability hours deselected

    Scenario: Volunteer does not receive special inactivity email
      Given A volunteer's last activity was on 6/4
      When The current day is 9/2
      Then The volunteer does not receive a special summer inactivity email
