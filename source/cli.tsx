#!/usr/bin/env node
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
		--regexp-str, -r Optional regexp string (can be typed through terminal ui after launching)

	Examples
	  $ regexp-it-cli 
	  $ regexp-it-cli --source "My text which\nis going to be used for regexp expectations"
	  $ regexp-it-cli  --source "My sample text\nas a source for regexp expectations" --regexp-str "t[a-t]"
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
		},
	},
);

render(<App source={cli.flags.source} regTxtVal={cli.flags.regexpStr} />);
