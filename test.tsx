import React from 'react';
import test from 'ava';
import chalk from 'chalk';
import {render} from 'ink-testing-library';
import App from './source/app.js';

test('shows info about switching between sections', t => {
	const {lastFrame} = render(<App />);

	t.regex(lastFrame()!, /<tab> - activates the next section/);
});

test('fills provided source text', t => {
	const {lastFrame} = render(
		<App source="My foo string\nas a source\nfor regular expressions experience" />,
	);

	t.regex(lastFrame()!, /My foo string\\nas/);
});

test('highlights matching segments', t => {
	const {lastFrame} = render(
		<App
			source="My foo fobu string\nas a source\nfor regular expressions experience."
			regTxtVal="fo[a-x]"
		/>,
	);

	t.true(lastFrame()!.includes(chalk.bgHex('#FEE715').hex('#101820')('foo')));
	t.true(lastFrame()!.includes(chalk.bgHex('#FEE715').hex('#101820')('for')));
	t.false(lastFrame()!.includes(chalk.bgHex('#FEE715').hex('#101820')('fobu')));
});
