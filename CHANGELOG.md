# Changelog

## [Unreleased]

### Added

- Support for editing sessions with `hocus edit`
- Support for adding new sessions with `hocus add`
- Support for renaming projects with `hocus rename`

### Changed

- Improvements of layout in `hocus log`
- Data directory is now located at `~/.hocus/data` by default
- Changes in the output of `hocus help`

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

[Unreleased]: https://github.com/paulkre/hocus/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/paulkre/hocus/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/paulkre/hocus/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/paulkre/hocus/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/paulkre/hocus/releases/tag/v1.0.0
