#!/usr/bin/env node
import fs from 'node:fs';
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import axios, {AxiosError, type AxiosResponse} from 'axios';
import App from './app.js';
import {patterns} from './patterns.js';

const cli = meow(
	`
	Usage
	  $ regexp-it-cli

	Options
		--source, -s                     Optional source string (can be typed through terminal ui after launching)
		--file, -f                       Optional file which content's should be used as a source
		--url, -u                        Optional url where extract data from which content's should be used as a source
		--regexp, -r                     Optional regexp string (can be typed through terminal ui after launching)
		--regexp-pattern, -p             Use available predefined named pattern as a regexp str
		--quit, -q                       Show only matched parts without running interactive ui
		--only-matched-parts, -m         Activate only matched parts option (remove not matched parts from a source)
		--new-line-after-each-match, -n  Add a new line after each match in a source
		--show-borders, -b               Whether to use borders
		--highlight, -h                  Use colors to highligh matched parts
		--slide-mode, -l                 Show all matches in slide mode one after one with specified interval
		--slide-delay, -e                The timer delay in slide mode (in seconds)
		--only-first-match, -i           Show only first match
		--only-last-match, -t            Show only last match
		--after-regexp, -a			     Show only matches suceeding specified regex match
		--before-regexp, -o			     Show only matches preceding specified regex match
		--starting-line-number           Starting line from a source to be used
		--ending-line-number             Ending line from a source to be used


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
	  $ rgi --file README.md --starting-line-number 6 --regexp-pattern url --only-matched-parts
	  $ rgi --file README.md --sln 6 --regexp-pattern url --only-matched-parts
	  $ rgi --file README.md --starting-line-number 6 --ending-line-number 15 --regexp-pattern url
	  $ rgi --file README.md --sln 6 --eln 15 --regexp-pattern url
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
			regexp: {
				type: 'string',
				shortFlag: 'r',
				aliases: ['regexpStr'],
			},
			regexpFlags: {
				type: 'string',
				aliases: ['flags'],
				default: 'gmi',
			},
			file: {
				type: 'string',
				shortFlag: 'f',
			},
			url: {
				type: 'string',
				shortFlag: 'u',
			},
			regexpPattern: {
				type: 'string',
				shortFlag: 'p',
			},
			immediateReturn: {
				type: 'boolean',
				aliases: ['exit', 'quit'],
				shortFlag: 'q',
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
				aliases: ['delay', 'slideDelay'],
				default: 1,
			},
			onlyFirstMatch: {
				type: 'boolean',
				shortFlag: 'i',
				default: false,
			},
			onlyLastMatch: {
				type: 'boolean',
				default: false,
			},
			afterRegexp: {
				type: 'string',
				shortFlag: 'a',
				aliases: ['afterRegexpStr'],
			},
			beforeRegexp: {
				type: 'string',
				shortFlag: 'o',
				aliases: ['beforeRegexpStr'],
			},
			startingLineNumber: {
				type: 'number',
				aliases: ['startL', 'stl', 'sln'],
			},
			endingLineNumber: {
				type: 'number',
				aliases: ['endL', 'enl', 'eln'],
			},
		},
	},
);

const {source, file, url, regexpPattern, immediateReturn} = cli.flags;
const {
	onlyMatchedParts,
	newLineAfterEachMatch,
	enableHighlighting,
	showBorders,
	slideMode,
	slideModeSpeed,
	onlyFirstMatch,
	onlyLastMatch,
	afterRegexp,
	beforeRegexp,
	startingLineNumber,
	endingLineNumber,
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
	regexpString = cli.flags.regexp;
	regexpFlags = cli.flags.regexpFlags;
}

if (file) {
	content = fs.readFileSync(file).toString().replaceAll(/\r\n/g, '\n');
} else if (url) {
	try {
		const result: AxiosResponse<string> = await axios.get(url);
		content = result.data;
	} catch (error) {
		if (error instanceof AxiosError) {
			console.log(
				`There is some error occured when fetching url:\n${error.message}`,
			);
			process.exit(0); // eslint-disable-line n/prefer-global/process
		}
	}
}

if (startingLineNumber && endingLineNumber) {
	content = content
		.split('\n')
		.slice(startingLineNumber - 1, endingLineNumber)
		.join('\n');
} else if (startingLineNumber) {
	content = content
		.split('\n')
		.slice(startingLineNumber - 1)
		.join('\n');
} else if (endingLineNumber) {
	content = content.split('\n').slice(0, endingLineNumber).join('\n');
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
		afterRegexpString={afterRegexp}
		beforeRegexpString={beforeRegexp}
	/>,
);

if (immediateReturn) {
	unmount();
}
