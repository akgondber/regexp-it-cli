type NamedPattern = Record<string, RegExp>;

const patterns: NamedPattern = {
	mention: /[@＠](?!\/)([\w/]{1,15})(?:\b(?!@|＠)|$)/gm,
	url: /(?:(?:(?:[a-z]+:)?\/{2})|w{3}\.)(?:\S+(?::\S*)?@)?(?:localhost|(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)){3}|(?:[a-z\u00A1-\uFFFF\d][-_]*)*[a-z\u00A1-\uFFFF\d]+(?:\.(?:[a-z\u00A1-\uFFFF\d]-*)*[a-z\u00A1-\uFFFF\d]+)*\.[a-z\u00A1-\uFFFF]{2,}\.?)(?::\d{2,5})?(?:[/?#][^\s"]*)?/gim,
	urlWithoutProtocol:
		/(?:localhost|(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)){3}|(?:[a-z\u00A1-\uFFFF\d][-_]*)*[a-z\u00A1-\uFFFF\d]+(?:\.(?:[a-z\u00A1-\uFFFF\d]-*)*[a-z\u00A1-\uFFFF\d]+)*\.[a-z\u00A1-\uFFFF]{2,}\.?)(?::\d{2,5})?(?:[/?#][^\s"]*)?/gim,
	urlWoP:
		/(?:localhost|(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)){3}|(?:[a-z\u00A1-\uFFFF\d][-_]*)*[a-z\u00A1-\uFFFF\d]+(?:\.(?:[a-z\u00A1-\uFFFF\d]-*)*[a-z\u00A1-\uFFFF\d]+)*\.[a-z\u00A1-\uFFFF]{2,}\.?)(?::\d{2,5})?(?:[/?#][^\s"]*)?/gim,
	largeWords: /\b\w{7,}\b/gm,
	base64: /(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)/gm,
	astral: /[\uD800-\uDBFF][\uDC00-\uDFFF]/gm,
	articlePlusWord: /(the|a)\s+\w+/gm,
	port: /:(\\d{2,5})/gm,
	script: /(<script\b[a-z\d]*\b[^>]*>([^]*?)<\/script>)/gim,
	import: /(?:^|\s)?import.*/gim,
	semver:
		/(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9})(?:-(?:--+)?(?:0|[1-9]\d*|\d*[a-z]+\d*)){0,100}(?=$| |\+|\.)(?:(?<=-\S+)(?:\.(?:--?|[\da-z-]*[a-z-]\d*|0|[1-9]\d*)){1,100}?)?(?!\.)(?:\+(?:[\da-z]\.?-?){1,100}?(?!\w))?(?!\+)/gim,
	youtube:
		/(?:youtube\.com\/\S*(?:(?:\/embed)?\/|watch\/?\?\S*?&?v=)|youtu\.be\/)([\w-]{6,11})/gm,
	info: /.*info.*/gim,
	infoAndNext: /info.*/gim,
	debug: /.*debug.*/gim,
	debugAndNext: /debug.*/gim,
	error: /.*error.*/gim,
	errorAndNext: /error.*/gim,
};

export {patterns};
