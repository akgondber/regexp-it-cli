# Release history

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<details>
  <summary><strong>Types of changes</strong></summary>

Changelog entries are classified using the following labels _(from [keep-a-changelog](http://keepachangelog.com/)_):

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

</details>

## [3.1.0] - 2024-05-05

**Added**

- `starting-line-number` option - Starting line from a source to be used
- `ending-line-number` option - Ending line from a source to be used

## [1.0.0] - [3.0.0] - 2023-06-22 - 2024-04-21

- Use string, file or url as a source content
- Optional regexp string (can be typed through terminal ui after launching)
- Use available predefined named pattern as a regexp str
- Show matched parts and quit without running interactive ui
- Activate only matched parts option (remove not matched parts from a source)
- Add a new line after each match in a source
- Specify whether to use borders
- Specify whether to use colors to highligh matched parts
- Show all matches in slide mode one after one with specified interval
- The timer delay in slide mode (in seconds)
- Show only first match
- Show only last match
- Show only matches suceeding specified regex match
- Show only matches preceding specified regex match
