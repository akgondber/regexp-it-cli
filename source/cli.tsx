#!/usr/bin/env node
import fs from 'node:fs';
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ regexp-it-cli

	Options
		--source, -s Optional source string (can be typed through terminal ui after launching)
		--file, -f   Optional file which content's should be used as a source
		--regexp-str, -r Optional regexp string (can be typed through terminal ui after launching)

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
		},
	},
);

const {source, file, regexpStr} = cli.flags;
let content = source;

if (file) {
	content = fs.readFileSync(file).toString().replaceAll(/\r\n/g, '\n');
}

render(<App source={content} regTxtVal={regexpStr} />);
