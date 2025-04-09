Feature: Accessing the suggested story

As a reader
In order to read a story
I want to get a suggested one

Scenario: There is a story to suggest
  Given a story to suggest is available
  When the user accesses the story
  Then the story should be presented to the user

Scenario: There is no story to suggest
  Given a story to suggest is not available
  When the user accesses the story
  Then the system should indicate that there are no stories to show
