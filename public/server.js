
/** GETメソッド */
function doGet() {
  /** @type {{key: string, question: string, choices: string[], answer: number}[]} */
  const questions = [];
  questions.push({
    key: 1,
    question: 'テスト問題',
    choices: ['1: 選択', '2: あ', '3: a'],
    answer: 2,
  });

  for (let i = 0; i < questions.length; i++) {
    const item = questions[i];
    appendQuestion(
      item.key,
      item.question,
      item.choices,
      item.answer
    );
  }

  const temp = HtmlService.createTemplateFromFile('index');
  temp.initialData = {
    test: 123,
    aaa: 'aiueo',
  };

  return temp.evaluate();
}


/** 問題を追加します */
function appendQuestion(key, question, choices, answer) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetById(0);

  const lastRow = sheet.getLastRow();
  const r = sheet.getRange(lastRow + 1, 1, 1, 5)
    .setValues([[new Date(), key, question, choices.join(','), answer]]);
}

function chatGptSample() {
  //スクリプトプロパティに設定したOpenAIのAPIキーを取得
  const apiKey = PropertiesService
    .getScriptProperties()
    .getProperty('OpenAI_Key');

  //ChatGPTのAPIのエンドポイントを設定
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  //ChatGPTに投げるメッセージを設定
  const messages = [
    { 'role': 'system', 'content': '文末に60%の確率で♡、40%の確率で☆をつけてください' },
    { 'role': 'user', 'content': '日本で最も北に位置する都道府県は？' },
  ];

  //OpenAIのAPIリクエストに必要なヘッダー情報を設定
  const headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-type': 'application/json',
    'X-Slack-No-Retry': 1
  };

  //オプションの設定(モデルやトークン上限、プロンプト)
  const options = {
    'muteHttpExceptions': true,
    'headers': headers,
    'method': 'POST',
    'payload': JSON.stringify({
      'model': 'gpt-4o-mini',
      'max_tokens': 2048,
      'temperature': 0.9,
      'messages': messages
    })
  };
  //OpenAIのChatGPTにAPIリクエストを送り、結果を変数に格納
  const response = JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());
  //ChatGPTのAPIレスポンスをログ出力
  //Logger.log(response.choices[0].message.content);
}
