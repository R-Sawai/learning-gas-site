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
 * 
 * @return {{ isComplete: boolean; functionCall: { name: string; arguments: string; } | null; message: string | null; }}
 */
function functionCall() {

  /**
   * HTTP通信のヘッダ
   * @type {GoogleAppsScript.URL_Fetch.HttpHeaders} 
   */
  const headers = {
    'Authorization': 'Bearer ' + OPENAI_API_KEY,
    'Content-Type': 'application/json',
  };

  // 「GCPの資格問題を作成して...」というプロンプト（一応英語）
  const systemPrompt = 'You are an excellent exam question creator. Please generate questions for Google Cloud Platform certification exams. The difficulty level should be adjusted based on the specific certification type, which will be provided separately. All questions, choices, and explanations must be written in Japanese.';
  // 「CDLの問題を10問追加して」というプロンプト
  const userPrompt = 'Please generate 10 new exam questions for the Google Cloud Digital Leader (CDL) certification.';

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
        "name": "appendQuestion",
        "description": "作成された問題を追加します",
        "parameters": {
          "type": "object",
          "properties": {
            "examType": {
              "type": "string",
              "description": "試験の種類"
            },
            "question": {
              "type": "string",
              "description": "問題文"
            },
            "choices": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "minItems": 4,
              "maxItems": 4,
              "description": "選択肢（4つ）"
            },
            "answer": {
              "type": "integer",
              "minimum": 0,
              "maximum": 3,
              "description": "答えのインデックス（0〜3）"
            }
          },
          "required": ["examType", "question", "choices", "answer"]
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
  const isComplete = (!(message?.function_call) && !(message?.function_call));

  /** @type {{ isComplete: boolean; functionCall: { name: string; arguments: string; } | null; message: string | null; }} */
  const result = {
    isComplete: isComplete,
    functionCall: message?.function_call ?? null,
    message: message?.content?.trim() ?? null,
  };

  return result;
}

