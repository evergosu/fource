Feature: Reading the story @database

As a reader
In order to read a story
I want to get a suggested one

Scenario: there is a story to suggest
  Given a story to suggest is available
  When a reader visits the home page
  Then the story should be presented to the reader

Scenario: there is no story to suggest
  Given a story to suggest is not available
  When a reader visits the home page
  Then the system should indicate that there are no stories to be shawn
