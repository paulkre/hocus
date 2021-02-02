# hocus

A powerful time tracking and note taking command line tool. The project was inspired by [Watson](https://github.com/TailorDev/Watson) and tries to extend its feature set.

![Demo](https://github.com/paulkre/hocus/blob/main/docs/demo.gif)

## Installation

### MacOS

Hocus is available for [Hombrew](https://brew.sh/):

```bash
brew tap paulkre/hocus
brew install hocus
```

### Other systems

To install Hocus on Linux or Windows you have to first install [Node.js](https://nodejs.org/en/download/) and then run:

```bash
npm install --global hocus
```

## Configuration

Hocus is completely file based – no database or API is being used. The default application's directory is `~/.hocus`. Just push `~/.hocus/data/` to a remote repository to back up all of your recorded data. You can change the default application's directory by creating a configuration file named `~/.hocusrc` with the following contents:

```json
{ "appDirectory": "/your/preferred/directory" }
```

## Usage

The command `hocus help` lists the available commands and `hocus help <command>` shows more details for an individual command.
