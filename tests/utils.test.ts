import test from 'ava';
import {execAll} from '../source/utils.js';

test('should return all matches', t => {
	const matches = execAll(/(\d+)/, 'Some 862m and 47m');
	const result = matches[0]!;
	t.is(result.match, '862');
	t.is(result.subMatches[0], '862');
	t.falsy(matches[1]);
});

test('should return all matches in global mode', t => {
	const result = execAll(/(\d+)/g, 'Some 862m and 47m');
	t.is(result[0]!.match, '862');
	t.is(result[1]!.match, '47');
});
