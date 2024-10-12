import { configDotenv } from 'dotenv'
import {
	TranslationRecognizer,
	SpeechRecognizer,
	SpeechSynthesizer,
	SpeechSynthesisOutputFormat,
	SpeechConfig,
	SpeechTranslationConfig,
	AudioConfig,
	AudioOutputStream,
	ResultReason
} from 'microsoft-cognitiveservices-speech-sdk'
import { AzureKeyCredential, TextAnalysisClient } from '@azure/ai-language-text'
import { TextAnalyticsClient } from '@azure/ai-text-analytics'
configDotenv()

// ============================
// === curated voice models ===
// ============================
const talents = [
	// styles: default, cheerful, newscast, empathetic
	'en-IN-NeerjaNeural', //* ================= 0 ===

	// styles: default
	'en-IN-AnanyaNeural', //* ================= 1 ===
	'zh-CN-XiaoyuMultilingualNeural', //* ===== 2 ===
	'zh-CN-XiaochenMultilingualNeural', //* === 3 ===

	// styles: default, empathetic, excited, friendly, shy/embarassed, serious, sad, relieved
	'en-US-SerenaMultilingualNeural', //* ===== 4 ===

	// styles: default, angry, cheerful, excited, friendly, unfriendly, sad, shouting, hopeful, terrified, whispering
	'en-US-JaneNeural', //* =================== 5 ===
	'en-US-NancyNeural' //* =================== 6 ===
]

// ================================
// === available output formats ===
// ================================
const formats = {
	mp3: SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3, // = 22 ===
	opus: SpeechSynthesisOutputFormat.Ogg48Khz16BitMonoOpus, // ======= 23 ===
	wav: SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm // ========= 20 ===
}

const lang = 'en-AU' // default language skill (accent)
const talent = talents[1]
const outputFormat = formats.opus

// ===========================
// === speak provided text ===
// ===========================
export const speak = async (text = '', talentID = -1, style = '', wav = false) => {
	if (!text) return false

	// === check for any Bengali characters in the text ===
	const isBengali = /[\u0980-\u09FF]/.test(text)

	// === check if the voice model is multilingual ===
	const isMultilingual = talent.includes('Multilingual')

	const stream = AudioOutputStream.createPullStream()
	const output = AudioConfig.fromStreamOutput(stream)
	const config = SpeechConfig.fromSubscription(
		process.env.AZURE_SPEECH_SUBSCRIPTION_KEY,
		process.env.AZURE_SPEECH_REGION
	)

	let language

	// === if the model is multilingual and there are Bengali characters in the text, set the language to Bengali. if the model is multilingual but there are no Bengali characters in the text, set the language to default accent ===
	if (isMultilingual) language = isBengali ? 'bn-BD' : lang
	// === if the model is not multilingual, set the language to the first 5 characters of the model name ===
	else language = talent.substring(0, 5)

	const voice = talentID >= 0 ? talents[talentID] : talent
	config.speechSynthesisLanguage = language
	config.speechSynthesisVoiceName = voice
	config.speechSynthesisOutputFormat = wav ? formats.wav : outputFormat

	let synthesizer = new SpeechSynthesizer(config, output)
	const closeSynthesizer = () => {
		output.close()
		synthesizer.close()
		synthesizer = undefined
	}

	return new Promise((resolve, _) => {
		const fnDone = result => {
			const audioBuffer = result.audioData
			closeSynthesizer()

			// === return a Buffer from audio data ===
			resolve(Buffer.from(audioBuffer))
		}

		const fnError = _ => {
			closeSynthesizer()
			resolve(false)
		}

		// === if a style is provided, use SSML to apply the style ===
		if (style && style != '') {
			const ssml = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${language}">
            <voice name="${voice}">
                <mstts:express-as style="${style}" styledegree="2">
                    ${text}
                </mstts:express-as>
            </voice>
        </speak>`
			synthesizer.speakSsmlAsync(ssml, fnDone, fnError)
		} else {
			synthesizer.speakTextAsync(text, fnDone, fnError)
		}
	})
}

// =============================
// === recognize spoken text ===
// =============================
export const recognize = async (buffer, bengali = false) => {
	if (!buffer) return false

	// === this function expects a Buffer as input ===
	const audio = AudioConfig.fromWavFileInput(buffer)
	const config = SpeechConfig.fromSubscription(
		process.env.AZURE_SPEECH_SUBSCRIPTION_KEY,
		process.env.AZURE_SPEECH_REGION
	)

	// === it is a good idea to explicitly set the language for speech recognition for Bengali language ===
	config.speechRecognitionLanguage = bengali ? 'bn-IN' : 'en-US'

	const recognizer = new SpeechRecognizer(config, audio)
	return new Promise((resolve, _) => {
		recognizer.recognizeOnceAsync(
			result => {
				audio.close()
				recognizer.close()
				if (result.reason === ResultReason.RecognizedSpeech) resolve(result.text)
				else resolve(false)
			},
			_ => {
				audio.close()
				recognizer.close()
				resolve(false)
			}
		)
	})
}

// ====================================================
// === translate spoken words into another language ===
// ====================================================
export const translate = async (buffer, from = 'en-US', to = 'bn-IN') => {
	if (!buffer) return false

	// === this function expects a Buffer as input ===
	const audio = AudioConfig.fromWavFileInput(buffer)
	const config = SpeechTranslationConfig.fromSubscription(
		process.env.AZURE_SPEECH_SUBSCRIPTION_KEY,
		process.env.AZURE_SPEECH_REGION
	)

	// === set the language for speech recognition ===
	config.speechRecognitionLanguage = from

	// === set the target language for translation ===
	config.addTargetLanguage(to)

	const translator = new TranslationRecognizer(config, audio)
	return new Promise((resolve, _) => {
		translator.recognizeOnceAsync(
			result => {
				audio.close()
				translator.close()
				if (result.reason === ResultReason.TranslatedSpeech) {
					const language = result.translations.languages
					resolve(result.translations.get(language[0]))
				} else resolve(false)
			},
			_ => {
				audio.close()
				translator.close()
				resolve(false)
			}
		)
	})
}

// ======================
// === summarize text ===
// ======================
export const summarize = async (text = '', length = null, language = 'en') => {
	if (!text || text === '') return false

	const endpoint = process.env.AZURE_LANUAGE_ENDPOINT
	const key = process.env.AZURE_LANUAGE_SUBSCRIPTION_KEY
	const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(key))

	const abstract = typeof length === 'boolean'
	const actions = { kind: abstract ? 'AbstractiveSummarization' : 'ExtractiveSummarization' }

	if (typeof length === 'number') actions.maxSentenceCount = length
	else if (typeof length === 'string') actions.sentenceLength = length
	else actions.maxSentenceCount = 3

	const poller = await client.beginAnalyzeBatch([actions], [text.trim()], language)
	const results = await poller.pollUntilDone()
	const logerror = result => {
		const { code, message } = result.error
		console.log(`Unexpected error (${code}): ${message}`)
	}

	let result
	for await (const item of results) {
		result = item
		break
	}

	if (result.error) {
		logerror(result)
		return false
	}

	if (result.kind !== actions.kind) return false

	const [data] = result.results
	if (data.error) {
		logerror(data)
		return false
	}

	if (abstract) return data.summaries.map(summary => summary.text)
	else return data.sentences.map(sentence => sentence.text)
}

// ==================================
// === detect sentiment from text ===
// ==================================
export const sentiment = async (text = '', language = 'en') => {
	if (!text || text === '') return false

	const endpoint = process.env.AZURE_LANUAGE_ENDPOINT
	const key = process.env.AZURE_LANUAGE_SUBSCRIPTION_KEY
	try {
		const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key))
		const [result] = await client.analyzeSentiment([text.trim()], language)

		if (result.error) return false
		if (result.sentiment) {
			return {
				sentiment: result.sentiment,
				scores: result.confidenceScores
			}
		}
	} catch (error) {
		return false
	}
	return false
}

// ====================================
// === extract keyphrases from text ===
// ====================================
export const keyphrases = async (text = '', language = 'en') => {
	if (!text || text === '') return false

	const endpoint = process.env.AZURE_LANUAGE_ENDPOINT
	const key = process.env.AZURE_LANUAGE_SUBSCRIPTION_KEY

	try {
		const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key))
		const [result] = await client.extractKeyPhrases([text.trim()], language)

		if (result.error) return false
		if (result.keyPhrases) return result.keyPhrases
	} catch (error) {
		return false
	}
	return false
}
