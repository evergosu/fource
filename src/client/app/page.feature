Feature: Basic configuration for tests

Scenario: Should have test link at home page
  Given User at home page
  When  Page loads
  Then  User can see test link
