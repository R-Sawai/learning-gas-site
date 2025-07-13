/// <reference path="openai.js" />

//@ts-check


/** GETメソッド */
function doGet() {
  const temp = HtmlService.createTemplateFromFile('index');
  const output = temp.evaluate();
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return output;
}


/**
 * 問題を追加します
 * @param {any} genre
 * @param {any} question
 * @param {any[]} choices 現状4枠のみ対応
 * @param {any} answer
 */
function appendQuestion(genre, question, choices, answer) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetById(0);

  if (!sheet) { return; }

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 8)
    .setValues([[
      new Date(),
      genre,
      question,
      choices[0],
      choices[1],
      choices[2],
      choices[3],
      answer
    ]]);
}


/**
 * 問題を取得します（HTML側から呼び出す関数）
 * @param {number} amount 取得する問題数
 * @returns {{ question: string; options: string[]; answer: number; }}
 */
function getQuizData(amount) {

  // 表からクイズデータの読み込み
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetById(0);
  if (!sheet) { return { question: '', options: [], answer: -1 }; }
  const lastRow = sheet.getLastRow() - 1;
  const tableData = sheet.getRange(2, 1, lastRow, 8).getValues();

  /** @type {{ question: string; options: string[]; answer: number; }[]} */
  const quizData = [];
  for (let row of tableData) {
    quizData.push({
      question: row[2],
      options: [...row.slice(3, 7)],
      answer: row[7],
    });
  }

  const idx = Math.floor(Math.random() * quizData.length);
  return quizData[idx];
}

