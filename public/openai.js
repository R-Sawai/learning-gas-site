//@ts-check

/**
 * 作業メモ
 * ・基本的に一つのリクエストにつき一つの回答とのこと（工夫すれば可能）
 */

const OPENAI_API_KEY = PropertiesService
  .getScriptProperties()
  .getProperty('OpenAI_Key');
const CHAT_GPT_URL = 'https://api.openai.com/v1/chat/completions';
const CHAT_GPT_VER = 'gpt-4o-mini';

/**
 * パラメータに応じて問題を生成するようOpenAI APIを叩きます
 * @param {'AWS CLF' | 'AWS SAA' | 'GCP CDL' | 'GCP ACE'} examType 
 * @return {{ isComplete: boolean; functionCall: { name: string; arguments: string; } | null; message: string | null; }}
 */
function functionCall(examType) {

  /**
   * HTTP通信のヘッダ
   * @type {GoogleAppsScript.URL_Fetch.HttpHeaders} 
   */
  const headers = {
    'Authorization': 'Bearer ' + OPENAI_API_KEY,
    'Content-Type': 'application/json',
  };

  // システムロール用プロンプト（一応英語）
  const systemPrompt = 'You are an excellent question creator. Please generate questions for studying GCP and AWS certification exams. The difficulty level will be specified separately, so follow the instructions accordingly. Always generate a wide range of questions randomly. Also, make sure that the question text, choices, and answers are all generated in Japanese.';
  // メインプロンプト
  const userPrompt = `Please generate questions for studying ${examType}.`;

  /**
   * ペイロード
   * @type {GoogleAppsScript.URL_Fetch.Payload} 
   */
  const payload = {
    'model': CHAT_GPT_VER,                            // GPTのモデル
    'max_tokens': 2048,                               // 最大トークン数
    'temperature': 0.9,                               // 自由度（0~1）高いほうが多様な回答
    'messages': [
      { 'role': 'system', 'content': systemPrompt },  // システムのロール
      { 'role': 'user', 'content': userPrompt },      // プロンプト
    ],
    'functions': [                                    // 関数群
      {
        'name': 'appendQuestion',
        'description': 'Add a generated question',
        'parameters': {
          'type': 'object',
          'properties': {
            'examType': {
              'type': 'string',
              'description': 'Exam type'
            },
            'question': {
              'type': 'string',
              'description': 'The type of certification exam.',
              'enum': ['AWS CLF', 'AWS SAA', 'GCP CDL', 'GCP ACE']
            },
            'choices': {
              'type': 'array',
              'items': {
                'type': 'string'
              },
              'minItems': 4,
              'maxItems': 4,
              'description': 'Choices (4 options)'
            },
            'answer': {
              'type': 'integer',
              'minimum': 0,
              'maximum': 3,
              'description': 'Answer index (0-3)'
            }
          },
          'required': ['examType', 'question', 'choices', 'answer']
        }
      },
    ],
    'function_call': 'auto',                          //
  };

  /** @type {GoogleAppsScript.URL_Fetch.URLFetchRequestOptions} */
  const options = {
    'method': 'post',
    'muteHttpExceptions': true,
    'headers': headers,
    'payload': JSON.stringify(payload),
  };

  // fetchの実行・結果の取得
  const response = UrlFetchApp.fetch(CHAT_GPT_URL, options);
  const json = JSON.parse(response.getContentText());
  Logger.log(json);

  // 結果の変換（function callingの実行）
  const message = json?.choices?.[0]?.message;
  const isComplete = Boolean(message?.function_call);

  /** @type {{ isComplete: boolean; functionCall: { name: string; arguments: string; } | null; message: string | null; }} */
  const result = {
    isComplete: isComplete,
    functionCall: message?.function_call ?? null,
    message: message?.content?.trim() ?? null,
  };

  return result;
}

