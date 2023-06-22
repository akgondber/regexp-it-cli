import React, {type ReactNode, useState} from 'react';
import {Text, Box, Newline, Spacer, useInput} from 'ink';
import TextInput from 'ink-text-input';
import execall from 'execall';
import RangeStepper from 'range-stepper';

type Props = {
	source?: string;
	regTxtVal?: string;
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
}: Props) {
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

		const acc = result.map(curr => {
			const plainText = <Text>{source.slice(j, curr.index)}</Text>;
			const highlightedText = (
				<Text color="#101820" backgroundColor="#FEE715">
					{source.slice(curr.index, curr.index + curr.match.length)}
				</Text>
			);

			j = curr.index + curr.match.length;

			return (
				<Text key={curr.index}>
					{plainText}
					{highlightedText}
				</Text>
			);
		});

		if (j < source.length) {
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
	const [regTxt, setRegTxt] = useState(regTxtValue);
	const [regFlags, setRegFlags] = useState(defaultFlags);
	const [textEditing, setTextEditing] = useState(false);
	const [regIsValid, setRegIsValid] = useState(true);
	const [regError, setRegError] = useState('');
	const [submitted, setSubmitted] = useState(regTxt !== '');
	const [lastTxt, setLastTxt] = useState(source);
	const [activeInputIndex, setActiveInputIndex] = useState(0);
	const [lastHighlightedText, setLastHighlightedText] = useState<
		ReactNode[] | ReactNode | string
	>(
		regTxt === '' || !submitted
			? txt
			: getHighlightedMatches(txt, regTxt, regFlags),
	);
	const [lastFlags, setLastFlags] = useState(defaultFlags);
	const [panelStepper, setPanelStepper] = useState(
		new RangeStepper({max: 2, current: 1}),
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
		if (key.tab) {
			if (!panelStepper.isCurrent(0))
				setActiveInputIndex(activeInputIndex === 1 ? 0 : 1);
			setPanelStepper(panelStepper.next().dup());
			setTextEditing(false);
		} else if (input === 'i' && !textEditing && panelStepper.isCurrent(0)) {
			setLastHighlightedText(defaultText);
			setTextEditing(true);
		}
	});

	const getPanelColor = (i: number) =>
		panelStepper.isCurrent(i) ? panelColors.active : panelColors.common;

	return (
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
			</Box>
			<Box borderStyle="single" borderColor={getPanelColor(0)}>
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
						setSubmitted(false);
						setRegTxt(value);
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
