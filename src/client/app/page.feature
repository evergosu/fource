Feature: Suggested story

Scenario: user should see a suggested story at home page
  Given user at home page
  When page loads
  Then user can see a suggested story
