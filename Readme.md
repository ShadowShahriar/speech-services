# speech-services

> [!IMPORTANT]
> Recently, I started working on the **fourth generation** of [**Jenny**][BOT], a Telegram bot with a quirky personality. There were some scenarios where it needed **Speech Synthesis** to narrate summaries of the user command, **Speech Recognition**, and **Translation**. So, I opted to use **Microsoft Azure Speech and Language services** to simplify the process. This repository demonstrates how I did these using their **SDK**.

This repository primarily focused on demonstrating the use of **Speech Synthesis** and **Speech Recognition**. Demonstration of **Translation**, **Text Summarization**, **Sentiment Detection**, and **Keyphrase Extraction** was added later.

**Useful Links:**

-   [**Quickstart: Convert text to speech**][MS_TTS_QS]
-   [**Quickstart: Recognize and convert speech to text**][MS_STT_QS]
-   [**Quickstart: Recognize and translate speech to text**][MS_RST_QS]
-   [**Quickstart: using text, document and conversation summarization**][MS_TS_QS]

**Useful Nodejs Examples:**

-   [**Text to Speech Quickstart Code**][EX_05]
-   [**Speech to Text Quickstart Code**][EX_04]
-   [**Speech Translation Quickstart Code**][EX_06]
-   [**Text Summarization Quickstart Code**][EX_03]
-   [**Extract Key Phrases from Alternative Document Input**][EX_02]
-   [**Analyze Text Sentiment**][EX_01]

**Samples from Official Repositories:**

-   [**Microsoft Cognitive Services Speech SDK**][REPO_01] (TTS, STT, Speech Translation)
-   [**Azure SDK for JavaScript**][REPO_02] (Text Summarization)

**Playground:**

-   [**Voice Gallery**][VOICE_GALLERY]
-   [**Text Summarization**][TEXT_SUMMARIZATION]

# Walk Through

> [!CAUTION]
> The official documentation for using these services was hard to follow. Some instructions seem confusing due to their use of **AI Language** and **Language Service** terms interchangeably. Also, there is so much information, yet everything is scattered and disorganized.

<!-- prettier-ignore -->
> [!NOTE] 
> **Speech Synthesis**, **Speech Recognition**, and **Translation** are **Speech Services** that requires the `cognitive-services-speech-sdk` NPM package. However, **Text Summarization** is a **Language Service** that requires a separate NPM package (`@azure/ai-language-text`), which, in turn, has a completely different type of API. It seems that Speech Services SDK and Language Services SDK were developed by separate developer teams with no correlation with each other's API structure.

## Creating the Resources

1. Sign in with your Microsoft or GitHub account and go to the [**Microsoft Azure Portal**][MS_AZURE_PORTAL].

2. Create a [**Speech Resource**][RES_SPEECH] and a [**Language Resource**][RES_LANG] in the Azure Portal.

3. Take notes for the **first key** (Key 1), **region** (e.g. eastus, westus) and **endpoint** for both resources. Create a `.env` file in the current directory and add the environmental variables here:

    ```yaml
    AZURE_SPEECH_SUBSCRIPTION_KEY=<SPEECH FIRST KEY>
    AZURE_SPEECH_REGION=<SPEECH REGION>
    AZURE_LANUAGE_ENDPOINT=<LANGUAGE ENDPOINT URL>
    AZURE_LANUAGE_SUBSCRIPTION_KEY=<LANGUAGE FIRST KEY>
    ```

## Installing the dependencies

Run the following command in the terminal:

```bash
npm install
```

This will install the following NPM dependencies:

-   [**dotenv**][NPM_04]: Required for defining environmental variables.
-   [**@azure/ai-language-text**][NPM_02]: Required for Text Summarization.
-   [**@azure/ai-text-analytics**][NPM_03]: Required for Sentiment Detection and Keyphrase Extraction.
-   [**microsoft-cognitiveservices-speech-sdk**][NPM_01]: Required for Text to Speech, Speech to Text, and Speech Translation.

## Testing

Run the following command in the terminal (You can also use `npm test` if you want):

```bash
node .
```

If everything is working as expected, it should produce the following output in the terminal:

```
Wrote speech to file: test.wav
Spoken text: Hi and thank you so much for paying a visit to this repository. It's been a pleasure to meet you.
Translated text: হাই এবং এই সংগ্রহস্থলটি দেখার জন্য আপনাকে অনেক ধন্যবাদ। আপনার সাথে দেখা করে খুব ভাল লাগল।
Summary:
[
  'As you probably guessed, this was heavily inspired by the story and plot of "The Greatest Showman."'
]
Sentiment:
{
  sentiment: 'negative',
  scores: { positive: 0, neutral: 0.03, negative: 0.97 }
}
Keyphrases:
[
  'favorite song cover', 'The Greatest Showman',
  'best violinist',      'crazy dream',
  'young boy',           'story',
  'childhood',           'classmates',
  'teachers',            'fun',
  'Life',                'turn',
  'stage',               'front',
  'millions',            'people',
  'doubters',            'wrong',
  'passion',             'plot'
]
```

# Methods

## speak

```typescript
const speak(text: string, talentID?: number, style?: string, wav?: boolean): Promise<Buffer|false>
```

| Parameter  | Description                                                                                                                                                                                                                                                                                                                                  |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`     | The given text that would be converted to speech.                                                                                                                                                                                                                                                                                            |
| `talentID` | Voice ID of the speaker. It can be any integer from **0** to **6**.                                                                                                                                                                                                                                                                          |
| `style`    | Narrative style of the given style. Accepted values are: `default`, `cheerful`, `newscast`, `empathetic`, `excited`, `unfriendly`, `friendly`, `shy`, `embarassed`, `serious`, `sad`, `relieved`, `angry`, `terrified`, `shouting`, `whispering` <br> Please note that **not all voice models will support all the styles mentioned above**. |
| `wav`      | When `true` the output format would be `wav` (PCM&nbsp;48Khz&nbsp;16Bit&nbsp;Mono). When `false` the output format would be `opus` (OGG&nbsp;48Khz&nbsp;16Bit&nbsp;Mono)                                                                                                                                                                     |

## recognize

```typescript
const recognize(buffer: Buffer, bengali?: boolean): Promise<string|false>
```

| Parameter | Description                                               |
| :-------- | :-------------------------------------------------------- |
| `buffer`  | Audio buffer (e.g. `fs.readFileSync("test.wav")`)         |
| `bengali` | `true` if the speech recognition language is **Bengali**. |

## translate

```typescript
const translate(buffer: Buffer, from?: string, to?: string): Promise<string|false>
```

| Parameter | Description                                       |
| :-------- | :------------------------------------------------ |
| `buffer`  | Audio buffer (e.g. `fs.readFileSync("test.wav")`) |
| `from`    | Speech recognition language (Default: `en-US`)    |
| `to`      | Translation language (Default: `bn-IN`)           |

## summarize

```typescript
const summarize(text: string, length?: boolean|string|null, language?: string): Promise<string|false>
```

| Parameter  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`     | Given long form text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `length`   | By default the `summarize` function would extract text from the given text, but if `length` is `true`, it will produce an **abstracted summary** of the given text. <br><br> `length` can be a string (`oneSentence`, `short`, `medium`) that denotes the size of the **extractive summary**. <br><br> `length` can also be any integer from **1** to **20** specifying the maximum number of sentences to be extracted in the **extractive summary**. Defaults to **3** when omitted. |
| `language` | Language of the given text (Default: `en`)                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## sentiment

<!-- prettier-ignore -->
```typescript
const sentiment: (text: string, language?: string) => Promise<false | {
    sentiment: "positive" | "neutral" | "negative";
    scores: { positive: number, neutral: number, negative: number };
}>
```

| Parameter  | Description                              |
| ---------- | ---------------------------------------- |
| `text`     | Given text                               |
| `language` | Language of the given text (Default: en) |

## keyphrases

```typescript
const keyphrases: (text: string, language?: string) => Promise<false | string[]>
```

| Parameter  | Description                              |
| ---------- | ---------------------------------------- |
| `text`     | Given text                               |
| `language` | Language of the given text (Default: en) |

# Language Support

For my use case, I needed support for **English** and **Bengali** languages. Here are the language codes I used for each service:

| Service                   | Language Codes        |
| ------------------------- | --------------------- |
| Text&nbsp;to&nbsp;Speech  | `en-AU`,&nbsp;`bn-BD` |
| Speech&nbsp;to&nbsp;Text  | `en-US`,&nbsp;`bn-IN` |
| Speech&nbsp;Translation   | `en-US`,&nbsp;`bn-IN` |
| Text&nbsp;Summarization   | `en`                  |
| Sentiment&nbsp;Detection  | `en`,&nbsp;`bn`       |
| Keyphrase&nbsp;Extraction | `en`,&nbsp;`bn`       |

<br>

**Support for other languages:**

-   [**Language Support (Text to Speech)**][LS_TTS]
-   [**Language Support (Speech to Text)**][LS_STT]
-   [**Language Support (Speech Translation)**][LS_RST]
-   [**Language Support (Text Summarization/Sentiment Detection/Keyphrase Extraction)**][LS_TS]

# License

The source code is licensed under the [**MIT License**][LICENSE].

<!-- === examples === -->

[EX_01]: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/textanalytics/ai-text-analytics/samples/v5/javascript/analyzeSentiment.js
[EX_02]: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/textanalytics/ai-text-analytics/samples/v5/javascript/alternativeDocumentInput.js
[EX_03]: https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/quickstart?pivots=programming-language-javascript&tabs=text-summarization%2Cwindows#code-example
[EX_04]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-to-text?tabs=windows%2Cterminal&pivots=programming-language-javascript#recognize-speech-from-a-file
[EX_05]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-javascript#create-the-application
[EX_06]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-translation?tabs=windows%2Cterminal&pivots=programming-language-javascript#translate-speech-from-a-file

<!-- === links === -->

[MS_AZURE_PORTAL]: https://portal.azure.com/#home
[RES_SPEECH]: https://portal.azure.com/#create/Microsoft.CognitiveServicesSpeechServices
[RES_LANG]: https://portal.azure.com/#create/Microsoft.CognitiveServicesTextAnalytics
[NPM_01]: https://www.npmjs.com/package/microsoft-cognitiveservices-speech-sdk
[NPM_02]: https://www.npmjs.com/package/@azure/ai-language-text
[NPM_03]: https://www.npmjs.com/package/@azure/ai-text-analytics
[NPM_04]: https://www.npmjs.com/package/dotenv
[LS_TS]: https://learn.microsoft.com/en-us/azure/ai-services/language-service/concepts/language-support
[LS_RST]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=speech-translation
[LS_STT]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=stt
[LS_TTS]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts
[MS_TS_QS]: https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/quickstart?pivots=programming-language-javascript&tabs=text-summarization%2Cwindows
[MS_RST_QS]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-translation?tabs=windows%2Cterminal&pivots=programming-language-javascript
[MS_STT_QS]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-speech-to-text?tabs=windows%2Cterminal&pivots=programming-language-javascript
[MS_TTS_QS]: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech?tabs=windows%2Cterminal&pivots=programming-language-javascript
[REPO_01]: https://github.com/Azure-Samples/cognitive-services-speech-sdk/tree/master/samples/js/node
[REPO_02]: https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/textanalytics/ai-text-analytics/samples/v5/javascript
[VOICE_GALLERY]: https://speech.azure.cn/portal/voicegallery
[TEXT_SUMMARIZATION]: https://language.cognitive.azure.com/tryout/summarization
[BOT]: https://t.me/jenny_the_robot
[LICENSE]: ./LICENSE
