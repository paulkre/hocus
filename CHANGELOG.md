# Changelog

## [2.4.0] - 2021-02-02

### Added

- README now contains an animated gif demoing the software
- MIT license

## [2.3.1] - 2021-02-02

### Changed

- Incorrect querying of sessions at end of month is now fixed

## [2.3.0] - 2021-02-01

### Added

- More options to modify the output of `hocus projects` (added flags `-d, --durations` and `-c, --client`)

### Changed

- Wording of command line output changed
- Tags are now displayed in `hocus log`
- Report output formatting improved

## [2.2.1] - 2021-01-31

### Changed

- Log output formatting fixed

## [2.2.0] - 2021-01-31

### Added

- Support for adding notes to sessions with `hocus note [id]`

## [2.1.0] - 2021-01-31

### Added

- List view for `hocus log` is now the default
- Introduction of `-a, --all` flag to override default timespan settings

### Changed

- Flag `-p, --project` exposed to allow querying sessions by project
- Output formatting of `hocus report` improved

## [2.0.3] - 2021-01-31

### Changed

- Support for add sessions with a single command without being asked for tags

## [2.0.2] - 2021-01-31

### Changed

- [2.0.1] had to be republished because it was not published correctly

## [2.0.1] - 2021-01-31

### Changed

- Bug fixed preventing removal of tags in edit mode

## [2.0.0] - 2021-01-31

### Added

- Support editing sessions with `hocus edit`
- Support adding new sessions with `hocus add`
- Support renaming projects with `hocus rename`
- Support removing sessions by ID and by project name with `hocus remove ...`
- Support for editing data with `vim`
- Support for grouping projects in clients
- Support for cancelling sessions with `hocus cancel`
- Support for restarting the last session with `hocus restart`
- Support for listing all projects with `hocus projects`
- Support for displaying summaries with `hocus report`

### Changed

- Improvements of layout in `hocus log`
- Data directory is now located at `~/.hocus/data` by default
- Changes in the output of `hocus help`
- Output of `hocus log` is now printed via `less` pager

## [1.2.0] - 2021-01-23

### Added

- Support tags in sessions
- Support filtering by tags in log command

### Changed

- Improved state handling

## [1.1.1] - 2021-01-23

### Changed

- Fix the previous release [1.1.0] which was not published correctly.

## [1.1.0] - 2021-01-23

### Added

- Default command for `hocus start`
- Ability to log only the first or the last few sessions with the options `--first` and `--last`

### Changed

- The version number is now being retrieved from `package.json` instead of being hard coded.

## [1.0.0] - 2021-01-22

### Added

- Initial release

[Unreleased]: https://github.com/paulkre/hocus/compare/v2.4.0...HEAD
[2.4.0]: https://github.com/paulkre/hocus/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/paulkre/hocus/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/paulkre/hocus/compare/v2.2.1...v2.3.0
[2.2.1]: https://github.com/paulkre/hocus/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/paulkre/hocus/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/paulkre/hocus/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/paulkre/hocus/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/paulkre/hocus/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/paulkre/hocus/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/paulkre/hocus/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/paulkre/hocus/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/paulkre/hocus/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/paulkre/hocus/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/paulkre/hocus/releases/tag/v1.0.0
