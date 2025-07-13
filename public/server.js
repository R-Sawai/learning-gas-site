
const questions = [{ question: "HTMLの略は？", options: ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "High Text Machine Language", "Hyper Text Markdown Language"], answer: 1 }, { "question": "JavaScriptで変数を宣言する方法は？", "options": ["var", "let", "const", "すべて正しい"], "answer": 3 }, { "question": "CSSの役割は？", "options": ["データの保存", "ページの構造設計", "見た目の装飾", "Webサーバー構築"], "answer": 2 }, { "question": "Reactは何？", "options": ["DB", "ブラウザ", "JSフレームワーク", "画像編集ソフト"], "answer": 2 }, { "question": "Gitのcloneの意味は？", "options": ["ブランチを切る", "プルリクを送る", "リポジトリをコピー", "履歴を削除"], "answer": 2 }, { "question": "HTTPは何の略？", "options": ["Hyper Text Transfer Protocol", "Hyper Tool Transfer Protocol", "Host Transfer Text Protocol", "None"], "answer": 0 }, { "question": "JavaScriptで関数を作るには？", "options": ["func()", "define()", "function", "create()"], "answer": 2 }, { "question": "フロントエンドのライブラリは？", "options": ["Django", "Flask", "Laravel", "Vue.js"], "answer": 3 }, { "question": "Tailwind CSSの特徴は？", "options": ["ユーティリティファースト", "AIベース", "バックエンド統合", "無限スクロール特化"], "answer": 0 }, { "question": "HTMLでリンクを作るタグは？", "options": ["<div>", "<span>", "<a>", "<link>"], "answer": 2 }];


/** GETメソッド */
function doGet() {


  /** @type {{question: string, choices: string[], answer: number}[]} */
  /*
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
  */

  const temp = HtmlService.createTemplateFromFile('index');
  temp.initialData = questions;
  const output = temp.evaluate();
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return output;
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

/**
 * 問題を取得します
 * @param {number} amount 取得する問題数
 * @returns {{ question: string; options: string[]; answer: number; }}
 */
function getQuizData(amount) {
  const idx = Math.floor(Math.random() * questions.length);
  return questions[idx];
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
