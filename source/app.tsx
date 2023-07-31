import React, {type ReactNode, useState, useEffect} from 'react';
import {Text, Box, Newline, Spacer, useInput} from 'ink';
import TextInput from 'ink-text-input';
import execall from 'execall';
import RangeStepper from 'range-stepper';
import {nanoid} from 'nanoid';

type Props = {
	source?: string;
	regTxtVal?: string;
	regFlags?: string;
	onlyMatchedParts?: boolean;
	newLineAfterEachMatch?: boolean;
	showBorders?: boolean;
	immediateReturn?: boolean;
	isHighlightingEnabled?: boolean;
	isSlideMode?: boolean;
	isSlideModeControlBarEnabled?: boolean;
	isFirstMatchOnly?: boolean;
	isLastMatchOnly?: boolean;
	slideModeSpeed?: number;
};

type SlideState = 'PAUSED' | 'RUNNING' | 'STOPPED';

const defaultText =
	'My sample string\nto be tested against\nsome regular expressions';
const defaultFlags = 'gm';

const panelColors = {
	active: '#a0fc02',
	common: '#f0f0fc',
};

const isNumeric = (value: string): boolean =>
	!Number.isNaN(value as any) && !Number.isNaN(Number.parseFloat(value));

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
	isSlideMode = false,
	isSlideModeControlBarEnabled = true,
	slideModeSpeed = 1,
	isFirstMatchOnly = false,
	isLastMatchOnly = false,
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
	const [onlyFirstMatch, setOnlyFirstMatch] = useState(isFirstMatchOnly);
	const [onlyLastMatch, setOnlyLastMatch] = useState(isLastMatchOnly);
	const [slideModeEnabled, setSlideModeEnabled] = useState(isSlideMode);
	const [slideModeState, setSlideModeState] = useState<SlideState>(
		slideModeEnabled ? 'RUNNING' : 'PAUSED',
	);
	const [sliderSpeed, setSliderSpeed] = useState(slideModeSpeed);
	const [sliderSpeedChangingValue, setSliderSpeedChangingValue] = useState(
		String(slideModeSpeed),
	);
	const [showSlideModeControlBar, setShowSlideModeControlBar] = useState(
		isSlideModeControlBarEnabled,
	);

	const getArrayOfMatches = (source: string, rgxTxt: string, flags = 'gm') => {
		const array: ReactNode[] = [];

		if (regTxt === '') {
			return [<Text key={nanoid()}>{source}</Text>];
		}

		const result = execall(new RegExp(rgxTxt, flags), source);
		let j = 0;
		let shouldExcludePlainText = hideStringBeforeFirstMatch;

		for (const curr of result) {
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
				array.push(<Text key={curr.index}>{highlightedText}</Text>);
				continue;
			}

			array.push(
				<Text key={curr.index}>
					{plainText}
					{highlightedText}
				</Text>,
			);
		}

		if (onlyFirstMatch) return array.slice(0, 1);
		if (onlyLastMatch) return array.slice(-1);
		return array;
	};

	const [txt, setTxt] = useState(source);
	const [regTxt, setRegTxt] = useState(regTxtValue ?? '');
	/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
	const [regFlags, setRegFlags] = useState(
		regPatternFlags ? regPatternFlags : regTxtValue === '' ? '' : defaultFlags,
	);
	/* eslint-enable unicorn/prefer-logical-operator-over-ternary */
	const fragments = slideModeEnabled
		? getArrayOfMatches(txt, regTxt, regFlags)
		: [];
	const [slideFragments, setSlideFragments] = useState<ReactNode[]>(fragments);

	useEffect(() => {
		if (slideModeEnabled && slideModeState === 'RUNNING') {
			const lineByLineInterval = setInterval(() => {
				setCurrentSlideIndex(previousIndex => {
					const newIndex = previousIndex + 1;
					if (newIndex >= slideFragments.length) {
						setSlideModeState('STOPPED');
						clearInterval(lineByLineInterval);
						return previousIndex;
					}

					return newIndex;
				});
			}, sliderSpeed * 1000);
			return () => {
				clearInterval(lineByLineInterval);
			};
		}

		return () => null;
	}, [slideModeEnabled, slideModeState, slideFragments.length, sliderSpeed]);

	const getHighlightedMatches = (
		source: string,
		rgxTxt: string,
		flags = 'gm',
	) => {
		if (regTxt === '') {
			return <Text>{source}</Text>;
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
				return (
					<Text key={curr.index}>
						{highlightedText}
						{showOnlyMatchedParts && <Newline />}
					</Text>
				);
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
			return [
				...acc,
				<Text key={nanoid(10)}>{source.slice(j, source.length)}</Text>,
			];
		}

		if (onlyFirstMatch) return acc.slice(0, 1);
		if (onlyLastMatch) return acc.slice(-1);

		return acc;
	};

	const [textEditing, setTextEditing] = useState(false);
	const [regIsValid, setRegIsValid] = useState(true);
	const [regError, setRegError] = useState('');
	const [submitted, setSubmitted] = useState(regTxt !== '');
	const [lastTxt, setLastTxt] = useState(source);
	const [activeInputIndex, setActiveInputIndex] = useState(0);
	const [displayOptions, setDisplayOptions] = useState(false);
	const [lastHighlightedText, setLastHighlightedText] = useState<
		ReactNode[] | ReactNode
	>(
		regTxt === '' || !submitted ? (
			<Text>{txt}</Text>
		) : (
			getHighlightedMatches(txt, regTxt, regFlags)
		),
	);
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	/* eslint-disable unicorn/prefer-logical-operator-over-ternary */
	const [lastFlags, setLastFlags] = useState(
		regPatternFlags ? regPatternFlags : regTxtValue === '' ? '' : defaultFlags,
	);
	/* eslint-enable unicorn/prefer-logical-operator-over-ternary */
	const [panelStepper, setPanelStepper] = useState(
		new RangeStepper({max: 2, current: 1}),
	);
	const [initialRun, setInitialRun] = useState(true);

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
				? `Showing ${
						isFirstMatchOnly
							? 'first match'
							: isLastMatchOnly
							? 'last match'
							: 'matches'
				  } for specified regexp `
				: activeInputIndex === 0
				? 'Typing regexp '
				: 'Typing flags';
		}

		return '';
	}

	const removeLastEchoChar = () => {
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
	};

	/* eslint-disable complexity */
	useInput((input, key) => {
		if (key.ctrl && input === 'o') {
			console.clear();
			if (slideModeEnabled && slideModeState === 'RUNNING') {
				setSlideModeState('PAUSED');
			} else if (slideModeEnabled && slideModeState !== 'STOPPED') {
				setSlideModeState('RUNNING');
			}

			if (displayOptions && !slideModeEnabled) {
				if (panelStepper.current < 2) {
					if (
						panelStepper.isCurrent(1) ||
						(panelStepper.isCurrent(0) && textEditing)
					) {
						removeLastEchoChar();
					} else if (!initialRun) {
						setSliderSpeed(1);
					}
				} else if (lastTxt !== '') {
					setLastHighlightedText(
						getHighlightedMatches(lastTxt, regTxt, regFlags),
					);
				}

				if (initialRun) setInitialRun(false);
			}

			setDisplayOptions(!displayOptions);
		} else if (displayOptions) {
			if (key.shift && key.tab) {
				setOptionsPanelStepper(optionsPanelStepper.previous().dup());
			} else if (key.tab) {
				setOptionsPanelStepper(optionsPanelStepper.next().dup());
			} else if (input === ' ') {
				if (optionsPanelStepper.isCurrent(0))
					setHideStringBeforeFirstMatch(!hideStringBeforeFirstMatch);
				else if (optionsPanelStepper.isCurrent(1))
					setHideStringAfterLastMatch(!hideStringAfterLastMatch);
				else if (optionsPanelStepper.isCurrent(2))
					setShowOnlyMatchedParts(!showOnlyMatchedParts);
				else if (optionsPanelStepper.isCurrent(3))
					setLineBreakAfterEachMatch(!lineBreakAfterEachMatch);
				else if (optionsPanelStepper.isCurrent(4)) {
					setOnlyFirstMatch(!onlyFirstMatch);
				} else if (optionsPanelStepper.isCurrent(5)) {
					setOnlyLastMatch(!onlyLastMatch);
				} else if (optionsPanelStepper.isCurrent(6)) {
					setOptionsPanelStepper(
						new RangeStepper({
							max: tunableOptions.length + (slideModeEnabled ? -1 : 1),
							current: optionsPanelStepper.value,
						}),
					);
					setSlideModeEnabled(!slideModeEnabled);
					setSlideFragments(getArrayOfMatches(txt, regTxt, regFlags));
					setCurrentSlideIndex(0);
				} else if (optionsPanelStepper.isCurrent(7)) {
					setShowSlideModeControlBar(!showSlideModeControlBar);
				}
			}
		} else if (slideModeEnabled) {
			if (key.tab) setOptionsPanelStepper(optionsPanelStepper.next().dup());

			if (input === ' ') {
				if (slideModeState === 'STOPPED') {
					setCurrentSlideIndex(0);
					setSlideModeState('RUNNING');
				} else {
					setSlideModeState(slideModeState === 'PAUSED' ? 'RUNNING' : 'PAUSED');
				}
			}
		} else if (key.tab) {
			if (!panelStepper.isCurrent(0))
				setActiveInputIndex(activeInputIndex === 1 ? 0 : 1);
			setPanelStepper(panelStepper.next().dup());
			setTextEditing(false);
		} else if (input === 'i' && !textEditing && panelStepper.isCurrent(0)) {
			setLastHighlightedText(<Text>defaultText</Text>);
			setTextEditing(true);
		} else if (key.ctrl && input === 's') {
			setLineBreakAfterEachMatch(!lineBreakAfterEachMatch);
		}
	});
	/* eslint-enable complexity */

	const getPanelColor = (i: number) =>
		panelStepper.isCurrent(i) ? panelColors.active : panelColors.common;

	const tunableOptions = [
		[
			'Hide string before first occurence of match:',
			hideStringBeforeFirstMatch,
		],
		['Hide string after last occurence of match:', hideStringAfterLastMatch],
		['Show only matched parts and remove the rest:', showOnlyMatchedParts],
		['Add a new line after each match:', lineBreakAfterEachMatch],
		['Show only first match:', onlyFirstMatch],
		['Show only last match:', onlyLastMatch],
		[
			'Enable slide mode to show matches sequentially with specified interval:',
			slideModeEnabled,
		],
	];

	const [optionsPanelStepper, setOptionsPanelStepper] = useState(
		new RangeStepper({
			max: tunableOptions.length + (slideModeEnabled ? 1 : -1),
			current: 0,
		}),
	);

	if (displayOptions) {
		return (
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
				{tunableOptions.map((pairs, i) => (
					<Box key={nanoid(10)}>
						<Box>
							<Text
								underline={optionsPanelStepper.isCurrent(i)}
								dimColor={!optionsPanelStepper.isCurrent(i)}
							>
								{pairs[0]}
							</Text>
						</Box>
						<Text italic>&nbsp;{pairs[1] ? 'yes' : 'no'}</Text>
					</Box>
				))}
				{slideModeEnabled && (
					<>
						<Box>
							<Text
								underline={optionsPanelStepper.isCurrent(7)}
								dimColor={!optionsPanelStepper.isCurrent(7)}
							>
								Enable control bar in slide mode to display help text about
								pause/continue actions:
							</Text>
							<Text italic>&nbsp;{slideModeEnabled ? 'yes' : 'no'}</Text>
						</Box>
						<Box>
							<Text
								underline={optionsPanelStepper.isCurrent(8)}
								dimColor={!optionsPanelStepper.isCurrent(8)}
							>
								Slide mode speed:&nbsp;
							</Text>

							<TextInput
								focus={optionsPanelStepper.isCurrent(8)}
								value={sliderSpeedChangingValue}
								onChange={value => {
									if (/^[\d.\s]*$/.test(value))
										setSliderSpeedChangingValue(value);
								}}
								onSubmit={value => {
									if (isNumeric(value)) {
										setSliderSpeed(Number(value));
									}
								}}
							/>
						</Box>
					</>
				)}
			</Box>
		);
	}

	return slideModeEnabled ? (
		<Box flexDirection="column">
			<Box>{slideFragments[currentSlideIndex]}</Box>
			{showSlideModeControlBar && (
				<Box marginTop={1} paddingLeft={3}>
					<Text>
						Press <Text bold>space</Text> to{' '}
						{slideModeState === 'STOPPED'
							? 'start again'
							: slideModeState === 'PAUSED'
							? 'continue'
							: 'pause'}
					</Text>
				</Box>
			)}
		</Box>
	) : immediateReturn ? (
		<Box>{lastHighlightedText}</Box>
	) : (
		<Box flexDirection="column">
			<Box>
				<Text>
					<GetStatusText />
				</Text>
				<Spacer />
				<Text>
					{panelStepper.isCurrent(0) && !textEditing ? (
						<Text>
							<Text bold>i</Text> - edit the source
						</Text>
					) : (
						<Text>
							<Text bold>tab</Text> - activate the next section
						</Text>
					)}
				</Text>
				<Spacer />
				<Text bold>ctrl+o</Text>
				<Text> - extra options</Text>
			</Box>
			<Box
				borderStyle={showBorders ? 'single' : undefined}
				borderColor={getPanelColor(0)}
				marginTop={1}
			>
				<Newline />
				{textEditing ? (
					<TextInput
						focus={panelStepper.isCurrent(0)}
						value={lastTxt}
						onChange={setLastTxt}
						onSubmit={value => {
							console.clear();
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
			<Box>
				<Box
					borderStyle="single"
					borderColor={getPanelColor(panelStepper.value)}
				>
					<Text
						italic={panelStepper.isCurrent(1)}
						color={regIsValid ? '' : 'red'}
					>
						Regexp: /
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
							const filteredMatches = getHighlightedMatches(
								lastTxt,
								value,
								regFlags,
							);
							setLastHighlightedText(filteredMatches);
							setRegTxt(value);
							setSubmitted(true);
						}}
					/>
					<Spacer />
					<Text>
						/
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
								console.clear();
								setSubmitted(true);
								setLastHighlightedText(
									getHighlightedMatches(lastTxt, regTxt, value),
								);
							}}
						/>
					</Text>
				</Box>
			</Box>
		</Box>
	);
}
