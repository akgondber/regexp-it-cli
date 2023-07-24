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
		--source, -s Optional source string (can be typed through terminal ui after launching)
		--file, -f   Optional file which content's should be used as a source
		--regexp-str, -r Optional regexp string (can be typed through terminal ui after launching)
		--regexp-pattern, -p Optional regexp named pattern to be used
		--immediate-return, -i Show only matched parts without running interactive ui
		--only-matched-parts, -m Activate only matched parts option (remove not matched parts from a source)
		--new-line-after-each-match, -n Add a new line after each match in a source
		--show-borders, -b Whether to use borders
		--enable-highlighting, -h Use highlighting for matching parts

	Examples
	  $ regexp-it-cli 
	  $ regexp-it-cli --source "My text which\nis going to be used for regexp expectations"
	  $ regexp-it-cli  --source "My sample text\nas a source for regexp expectations" --regexp-str "t[a-t]"
	  $ regexp-it-cli --file "content.txt" --regexp-str "([Tt]he|a) \\w{4,6}\\b"
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
				default: true,
			},
			enableHighlighting: {
				type: 'boolean',
				shortFlag: 'h',
				default: true,
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
	/>,
);

if (immediateReturn) {
	unmount();
}
