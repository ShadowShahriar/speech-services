import { writeFile, readFile } from 'fs/promises'
import { speak, recognize, translate, summarize, sentiment, keyphrases } from './api.js'

async function main() {
	// ========================
	// === Speech Synthesis ===
	// ========================
	const text = "Hi and thank you so much for paying a visit to this repository. It's been a pleasure to meet you!"
	const speakBuffer = await speak(text, 5, 'cheerful', true)

	// =======================
	// === Writing to File ===
	// =======================
	const filename = 'test.wav'
	await writeFile(filename, speakBuffer)
	console.log('Wrote speech to file:', filename)

	// ==========================
	// === Speech Recognition ===
	// ==========================
	const recognitionResult = await recognize(speakBuffer)
	console.log('Spoken text:', recognitionResult)

	// ==========================
	// === Speech Translation ===
	// ==========================
	const translationResult = await translate(speakBuffer, 'en-US', 'bn-IN')
	console.log('Translated text:', translationResult)

	// ==========================
	// === Text Summarization ===
	// ==========================
	const prompt = await readFile('test.txt', 'utf8')
	const summarizationResult = await summarize(prompt, 1, 'en')
	console.log('Summary:')
	console.log(summarizationResult)

	// ===========================
	// === Sentiment Detection ===
	// ===========================
	const emotion = await sentiment('আমার মন খারাপ', 'bn')
	console.log('Sentiment:')
	console.log(emotion)

	// ============================
	// === Keyphrase Extraction ===
	// ============================
	const keyphasesResult = await keyphrases(prompt, 'en')
	console.log('Keyphrases:')
	console.log(keyphasesResult)
}
main()
