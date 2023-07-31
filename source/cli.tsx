#!/usr/bin/env node
import fs from 'node:fs';
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';
import {patterns} from './patterns.js';

const cli = meow(
	`
	Usage
	  $ regexp-it-cli

	Options
		--source, -s                     Optional source string (can be typed through terminal ui after launching)
		--file, -f                       Optional file which content's should be used as a source
		--regexp-str, -r                 Optional regexp string (can be typed through terminal ui after launching)
		--regexp-pattern, -p             Use available predefined named pattern as a regexp str
		--immediate-return, -e           Show only matched parts without running interactive ui
		--only-matched-parts, -m         Activate only matched parts option (remove not matched parts from a source)
		--new-line-after-each-match, -n  Add a new line after each match in a source
		--show-borders, -b               Whether to use borders
		--highlight, -h                  Use colors to highligh matched parts
		--slide-mode, -l                 Show all matches in slide mode one after one with specified interval
		--slide-delay, -d                The timer delay in slide mode (in seconds)
		--only-first-match, -a           Show only first match
		--only-last-match, -t            Show only last match


	Examples
	  $ regexp-it-cli 
	  $ regexp-it-cli --source "My text which\nis going to be used for regexp expectations"
	  $ regexp-it-cli  --source "My sample text\nas a source for regexp expectations" --regexp-str "t[a-t]"
	  $ regexp-it-cli --file "content.txt" --regexp-str "([Tt]he|a) \\w{4,6}\\b"
	  $ regexp-it-cli --file current.log --regexp-pattern info
	  $ regexp-it-cli --file current.log --regexp-pattern error -h f
	  $ regexp-it-cli --file server.log --regexp-pattern debug --slide-mode
	  $ regexp-it-cli --file file.txt --regexp-pattern url --slide-mode
	  $ rgi --file README.md --regexp-pattern url --highlight false
	  $ rgi --file README.md --regexp-pattern urlWoP  --slide-mode --only-matched-parts
	  $ rgi --file example.txt --regexp-pattern mention --only-first-match
	  $ rgi --file someFile.txt --regexp-pattern articlePlusWord --e
	  $ rgi --file index.js --regexp-pattern import -m -e
	  $ rgi --file index.js --regexp-pattern import --only-first-match --exit
	  $ rgi --file app.log --regexp-pattern error --only-last-match
`,
	{
		importMeta: import.meta,
		flags: {
			source: {
				type: 'string',
				shortFlag: 's',
				default:
					'My sample text\nto be used as a source\nfor regular expressions experience',
			},
			regexpStr: {
				type: 'string',
				shortFlag: 'r',
			},
			file: {
				type: 'string',
				shortFlag: 'f',
			},
			regexpPattern: {
				type: 'string',
				shortFlag: 'p',
			},
			immediateReturn: {
				type: 'boolean',
				aliases: ['exit'],
				shortFlag: 'i',
			},
			onlyMatchedParts: {
				type: 'boolean',
				shortFlag: 'm',
				default: false,
			},
			newLineAfterEachMatch: {
				type: 'boolean',
				shortFlag: 'n',
				default: false,
			},
			showBorders: {
				type: 'boolean',
				shortFlag: 'b',
				default: false,
			},
			enableHighlighting: {
				type: 'boolean',
				shortFlag: 'h',
				aliases: ['highlight'],
				default: true,
			},
			slideMode: {
				type: 'boolean',
				shortFlag: 'l',
				default: false,
			},
			slideModeSpeed: {
				type: 'number',
				shortFlag: 'e',
				aliases: ['slideDelay'],
				default: 1,
			},
			onlyFirstMatch: {
				type: 'boolean',
				default: false,
			},
			onlyLastMatch: {
				type: 'boolean',
				default: false,
			},
		},
	},
);

const {source, file, regexpPattern, immediateReturn} = cli.flags;
const {
	onlyMatchedParts,
	newLineAfterEachMatch,
	enableHighlighting,
	showBorders,
	slideMode,
	slideModeSpeed,
	onlyFirstMatch,
	onlyLastMatch,
} = cli.flags;

let regexpString;
let regexpFlags;
let content = source;

if (regexpPattern) {
	if (Object.keys(patterns).includes(regexpPattern)) {
		const regexpValue: RegExp = patterns[regexpPattern]!;
		regexpString = regexpValue.source;
		regexpFlags = regexpValue.flags;
	}
} else {
	regexpString = cli.flags.regexpStr;
}

if (file) {
	content = fs.readFileSync(file).toString().replaceAll(/\r\n/g, '\n');
}

const {unmount} = render(
	<App
		source={content}
		regTxtVal={regexpString}
		regFlags={regexpFlags}
		onlyMatchedParts={onlyMatchedParts}
		newLineAfterEachMatch={newLineAfterEachMatch}
		immediateReturn={immediateReturn}
		showBorders={showBorders}
		isHighlightingEnabled={enableHighlighting}
		isSlideMode={slideMode}
		slideModeSpeed={slideModeSpeed}
		isFirstMatchOnly={onlyFirstMatch}
		isLastMatchOnly={onlyLastMatch}
	/>,
);

if (immediateReturn) {
	unmount();
}
