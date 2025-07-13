//@ts-check

const OPENAI_API_KEY = PropertiesService
  .getScriptProperties()
  .getProperty('OpenAI_Key');
const CHAT_GPT_URL = 'https://api.openai.com/v1/chat/completions';
const CHAT_GPT_VER = 'gpt-4o-mini';

function test() {

  /**
   * HTTP通信のヘッダ
   * @type {GoogleAppsScript.URL_Fetch.HttpHeaders} 
   */
  const headers = {
    'Authorization': 'Bearer ' + OPENAI_API_KEY,
    'Content-Type': 'application/json',
  };

  //* とりあえずなしで
  const systemPrompt = '';
  const userPrompt = 'send_mail関数を用いて挨拶をして';

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
        'name': 'send_email',
        'description': 'メールを送信する',
        'parameters': {
          'type': 'object',
          'properties': {
            'email': {
              'type': 'string',
              'description': 'メールアドレス',
            },
            'body': {
              'type': 'string',
              'description': '本文',
            },
            'subject': {
              'type': 'string',
              'description': '件名',
            }
          },
          'required': ['email'],
        },
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

  // 結果の変換（function callingの実行）
  let return_text;
  if (json.choices[0].message.function_call) {
    // 関数名
    const function_name = json.choices[0].message.function_call.name;
    const function_arguments = JSON.parse(json.choices[0].message.function_call.arguments);
    if (function_name === 'send_email') {
      /**
      return_text = send_email(function_arguments.email, function_arguments.body, function_arguments.subject)
       */
    }
  } else {
    // function calling が実行されなかった場合、ChatGPTの返答として返す。
    return_text = json['choices'][0]['message']['content'].trim()
  }
  console.log(return_text)
  return (return_text)
}

