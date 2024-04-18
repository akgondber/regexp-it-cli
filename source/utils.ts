import cloneRegexp from 'clone-regexp';

type MatchItem = {
	match: string;
	subMatches: any;
	index: number;
};

const execAll = (regexp: RegExp, string: string): MatchItem[] => {
	let match;
	const matches = [];
	const clonedRegexp = cloneRegexp(regexp, {lastIndex: 0});
	const isGlobal = clonedRegexp.global;

	while ((match = clonedRegexp.exec(string))) {
		matches.push({
			match: match[0],
			subMatches: match.slice(1),
			index: match.index,
		});

		if (!isGlobal || match[0] === '') {
			break;
		}
	}

	return matches;
};

export {execAll, type MatchItem};
