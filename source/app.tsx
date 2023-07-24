import React, {type ReactNode, useState} from 'react';
import {Text, Box, Newline, Spacer, useInput} from 'ink';
import TextInput from 'ink-text-input';
import execall from 'execall';
import RangeStepper from 'range-stepper';

type Props = {
	source?: string;
	regTxtVal?: string;
	regFlags?: string;
	onlyMatchedParts?: boolean;
	newLineAfterEachMatch?: boolean;
	showBorders?: boolean;
	immediateReturn?: boolean;
	isHighlightingEnabled?: boolean;
};

const defaultText =
	'My sample string\nto be tested against\nsome regular expressions';
const defaultFlags = 'gm';

const panelColors = {
	active: '#a0fc02',
	common: '#f0f0fc',
};

function getErrorMessage(error: unknown) {
	if (error instanceof Error) return error.message;
	return String(error);
}

export default function App({
	source = defaultText,
	regTxtVal: regTxtValue = '',
	regFlags: regPatternFlags,
	onlyMatchedParts,
	newLineAfterEachMatch,
	showBorders,
	immediateReturn,
	isHighlightingEnabled = true,
}: Props) {
	const [hideStringBeforeFirstMatch, setHideStringBeforeFirstMatch] =
		useState(false);
	const [hideStringAfterLastMatch, setHideStringAfterLastMatch] =
		useState(false);
	const [showOnlyMatchedParts, setShowOnlyMatchedParts] =
		useState(onlyMatchedParts);
	const [lineBreakAfterEachMatch, setLineBreakAfterEachMatch] = useState(
		newLineAfterEachMatch,
	);

	const getHighlightedMatches = (
		source: string,
		rgxTxt: string,
		flags = 'gm',
	) => {
		if (regTxt === '') {
			return source;
		}

		const result = execall(new RegExp(rgxTxt, flags), source);
		let j = 0;
		let shouldExcludePlainText = hideStringBeforeFirstMatch;

		const acc = result.map(curr => {
			if (showOnlyMatchedParts) {
				shouldExcludePlainText = true;
			} else if (shouldExcludePlainText) {
				shouldExcludePlainText = j === 0;
			}

			const plainText = <Text>{source.slice(j, curr.index)}</Text>;
			const highlightedText = (
				<Text
					color={isHighlightingEnabled ? '#101820' : undefined}
					backgroundColor={isHighlightingEnabled ? '#FEE715' : undefined}
				>
					{source.slice(curr.index, curr.index + curr.match.length)}
					{lineBreakAfterEachMatch ? <Newline /> : ''}
				</Text>
			);

			j = curr.index + curr.match.length;

			if (shouldExcludePlainText) {
				return <Text key={curr.index}>{highlightedText}</Text>;
			}

			return (
				<Text key={curr.index}>
					{plainText}
					{highlightedText}
				</Text>
			);
		});

		if (
			j < source.length &&
			!hideStringAfterLastMatch &&
			!showOnlyMatchedParts
		) {
			return (
				<Text>
					{acc}
					<Text>{source.slice(j, source.length)}</Text>
				</Text>
			);
		}

		return acc;
	};

	const [txt, setTxt] = useState(source);
	const [regTxt, setRegTxt] = useState(regTxtValue ?? '');
	/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
	const [regFlags, setRegFlags] = useState(
		regPatternFlags ? regPatternFlags : regTxtValue === '' ? '' : defaultFlags,
	);
	/* eslint-enable unicorn/prefer-logical-operator-over-ternary */
	const [textEditing, setTextEditing] = useState(false);
	const [regIsValid, setRegIsValid] = useState(true);
	const [regError, setRegError] = useState('');
	const [submitted, setSubmitted] = useState(regTxt !== '');
	const [lastTxt, setLastTxt] = useState(source);
	const [activeInputIndex, setActiveInputIndex] = useState(0);
	const [displayOptions, setDisplayOptions] = useState(false);
	const [lastHighlightedText, setLastHighlightedText] = useState<
		ReactNode[] | ReactNode | string
	>(
		regTxt === '' || !submitted
			? txt
			: getHighlightedMatches(txt, regTxt, regFlags),
	);
	/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
	const [lastFlags, setLastFlags] = useState(
		regPatternFlags ? regPatternFlags : regTxtValue === '' ? '' : defaultFlags,
	);
	/* eslint-enable unicorn/prefer-logical-operator-over-ternary */
	const [panelStepper, setPanelStepper] = useState(
		new RangeStepper({max: 2, current: 1}),
	);
	const [optionsPanelStepper, setOptionsPanelStepper] = useState(
		new RangeStepper({max: 3, current: 0}),
	);

	function GetStatusText() {
		if (!regIsValid) {
			return `Bad reg expression: ${regError}`;
		}

		if (textEditing) {
			return 'Editing the source text';
		}

		if (panelStepper.isCurrent(0)) {
			return 'Selected source text panel';
		}

		if (regTxt !== '' && !submitted) {
			return activeInputIndex === 0 ? 'Typing regexp' : 'Typing flags';
		}

		if (submitted) {
			return txt === lastTxt
				? 'Showing highlights for specified regexp'
				: activeInputIndex === 0
				? 'Typing regexp '
				: 'Typing flags';
		}

		return '';
	}

	useInput((input, key) => {
		if (displayOptions) {
			if (key.tab) {
				setOptionsPanelStepper(optionsPanelStepper.next().dup());
			} else if (input === ' ') {
				if (optionsPanelStepper.isCurrent(0))
					setHideStringBeforeFirstMatch(!hideStringBeforeFirstMatch);
				else if (optionsPanelStepper.isCurrent(1))
					setHideStringAfterLastMatch(!hideStringAfterLastMatch);
				else if (optionsPanelStepper.isCurrent(2))
					setShowOnlyMatchedParts(!showOnlyMatchedParts);
				else setLineBreakAfterEachMatch(!lineBreakAfterEachMatch);
			} else if (key.ctrl && input === 'o') {
				setDisplayOptions(!displayOptions);
				if (panelStepper.current < 2) {
					const target = panelStepper.current === 0 ? lastTxt : regTxt;
					const setTarget = panelStepper.current === 0 ? setLastTxt : setRegTxt;
					const newTargetValue = target.slice(0, -1);
					setTarget(newTargetValue);
					if (newTargetValue.length > 0)
						if (panelStepper.current === 0)
							setLastHighlightedText(
								getHighlightedMatches(newTargetValue, regTxt, regFlags),
							);
						else
							setLastHighlightedText(
								getHighlightedMatches(lastTxt, newTargetValue, regFlags),
							);
				} else if (lastTxt !== '') {
					setLastHighlightedText(
						getHighlightedMatches(lastTxt, regTxt, regFlags),
					);
				}
			}
		} else if (key.ctrl && input === 'o') {
			setDisplayOptions(!displayOptions);
		} else if (key.tab) {
			if (!panelStepper.isCurrent(0))
				setActiveInputIndex(activeInputIndex === 1 ? 0 : 1);
			setPanelStepper(panelStepper.next().dup());
			setTextEditing(false);
		} else if (input === 'i' && !textEditing && panelStepper.isCurrent(0)) {
			setLastHighlightedText(defaultText);
			setTextEditing(true);
		} else if (key.ctrl && input === 's') {
			setLineBreakAfterEachMatch(!lineBreakAfterEachMatch);
		}
	});

	const getPanelColor = (i: number) =>
		panelStepper.isCurrent(i) ? panelColors.active : panelColors.common;

	return displayOptions ? (
		<Box flexDirection="column">
			<Box marginBottom={2}>
				<Text bold>tab</Text>
				<Text> - activates the next option item</Text>
				<Spacer />
				<Text bold>space</Text>
				<Text> - toggles a boolean option</Text>
				<Spacer />
				<Text bold>ctrl+o</Text>
				<Text> - back</Text>
			</Box>
			<Box>
				<Text
					underline={optionsPanelStepper.isCurrent(0)}
					dimColor={!optionsPanelStepper.isCurrent(0)}
				>
					Hide string before first occurence of match:
				</Text>
				<Text italic>&nbsp;{hideStringBeforeFirstMatch ? 'yes' : 'no'}</Text>
			</Box>
			<Box>
				<Text
					underline={optionsPanelStepper.isCurrent(1)}
					dimColor={!optionsPanelStepper.isCurrent(1)}
				>
					Hide string after last occurence of match:
				</Text>
				<Text italic>&nbsp;{hideStringAfterLastMatch ? 'yes' : 'no'}</Text>
			</Box>
			<Box>
				<Text
					underline={optionsPanelStepper.isCurrent(2)}
					dimColor={!optionsPanelStepper.isCurrent(2)}
				>
					Show only matched parts and remove the rest:
				</Text>
				<Text italic>&nbsp;{showOnlyMatchedParts ? 'yes' : 'no'}</Text>
			</Box>
			<Box>
				<Text
					underline={optionsPanelStepper.isCurrent(3)}
					dimColor={!optionsPanelStepper.isCurrent(3)}
				>
					Add a new line after each match:
				</Text>
				<Text italic>&nbsp;{lineBreakAfterEachMatch ? 'yes' : 'no'}</Text>
			</Box>
		</Box>
	) : immediateReturn ? (
		<Box>
			<Text>{lastHighlightedText}</Text>
		</Box>
	) : (
		<Box flexDirection="column">
			<Box>
				<Text>Status: </Text>
				<Text>
					<GetStatusText />
				</Text>
				<Spacer />
				<Text>
					{panelStepper.isCurrent(0) && !textEditing
						? 'Type `i` to start editing source text'
						: '<tab> - activates the next section'}
				</Text>
				<Spacer />
				<Text bold>ctrl+o</Text>
				<Text> - setup extra options</Text>
			</Box>
			<Box
				borderStyle={showBorders ? 'single' : undefined}
				borderColor={getPanelColor(0)}
			>
				<Newline />
				{textEditing ? (
					<TextInput
						focus={panelStepper.isCurrent(0)}
						value={lastTxt}
						onChange={setLastTxt}
						onSubmit={value => {
							setLastTxt(value);
							setLastHighlightedText(
								getHighlightedMatches(value, regTxt, regFlags),
							);
							setPanelStepper(panelStepper.next().dup());
							setTextEditing(false);
						}}
					/>
				) : (
					<Text>{lastHighlightedText}</Text>
				)}
			</Box>
			<Box borderStyle="single" borderColor={getPanelColor(1)}>
				<Text
					italic={panelStepper.isCurrent(1)}
					color={regIsValid ? '' : 'red'}
				>
					Regexp:{' '}
				</Text>
				<TextInput
					focus={panelStepper.isCurrent(1)}
					value={regTxt}
					onChange={value => {
						if (!displayOptions) {
							setSubmitted(false);
							setRegTxt(value);
						}
					}}
					onSubmit={value => {
						let isValid = true;

						try {
							new RegExp(value, regFlags); // eslint-disable-line no-new
						} catch (error) {
							isValid = false;

							setRegError(getErrorMessage(error));
							setRegIsValid(false);
						}

						if (!isValid) {
							return;
						}

						if (regError !== '') {
							setRegError('');
						}

						if (!regIsValid) {
							setRegIsValid(true);
						}

						setTxt(lastTxt);
						setLastHighlightedText(
							getHighlightedMatches(lastTxt, value, regFlags),
						);
						setRegTxt(value);
						setSubmitted(true);
					}}
				/>
				<Spacer />
				<Text>
					<Text italic={panelStepper.isCurrent(2)}>Flags: </Text>
					<TextInput
						focus={panelStepper.isCurrent(2)}
						value={regFlags}
						onChange={value => {
							setSubmitted(false);

							const hasDup = [...value].some(
								(v, i, a) => a.lastIndexOf(v) !== i,
							);
							if (hasDup) {
								setRegFlags(lastFlags);
								return;
							}

							for (const flag of value) {
								if (!'gimsuy'.includes(flag)) {
									setRegFlags(lastFlags);
									return;
								}
							}

							setLastFlags(value);
							setRegFlags(value);
						}}
						onSubmit={value => {
							setSubmitted(true);
							setLastHighlightedText(
								getHighlightedMatches(lastTxt, regTxt, value),
							);
						}}
					/>
				</Text>
			</Box>
		</Box>
	);
}
