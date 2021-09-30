interface Settings {
	numberOfParagraphs?: Number,
	sentencesPerParagraph?: Number,
	maxSentenceLength?: Number,
	minSentenceLength?: Number,
	isHeadline?: Boolean,
	isName?: Boolean,
	nyordFrequency?: Number,
	neologismerFrequency?: Number,
	namnFrequency?: Number,
	buzzFrequency?: Number,
	useLörem?: Boolean,
	punchline?: String,
	wrapInDiv?: Boolean,
	paragraphStartWrap?: String,
	paragraphEndWrap?: String,
	alwaysWrapParagraph?: Boolean
}

declare const löremIpsum: (settings?: Settings) => string;

export = löremIpsum;