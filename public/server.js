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
 * @param {any} examType 試験の種類
 * @param {any} question 問題
 * @param {any[]} choices 選択肢（現状4枠のみ対応）
 * @param {any} answer 答えのインデックス
 */
function appendQuestion(examType, question, choices, answer) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetById(0);

  if (!sheet) { return; }

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 8)
    .setValues([[
      new Date(),
      examType,
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
 * @param {'AWS CLF' | 'AWS SAA' | 'GCP CDL' | 'GCP ACE'} examType 
 * @returns {{ examType: string; question: string; options: string[]; answer: number; }}
 */
function getQuizData(examType = 'AWS CLF') {

  /** fcの結果 */
  const fcResult = functionCall(examType);

  if (fcResult.isComplete && fcResult.functionCall) {
    const functionName = fcResult.functionCall.name;
    const functionArguments = JSON.parse(fcResult.functionCall.arguments);
    switch (functionName) {
      case 'appendQuestion':
        /** @type {{ examType: string; question: string; options: string[]; answer: number; }} */
        const quiz = {
          examType: functionArguments.examType ?? '',
          question: functionArguments.question ?? '',
          options: functionArguments.choices ?? [],
          answer: functionArguments.answer ?? -1,
        };
        appendQuestion(
          quiz.examType,
          quiz.question,
          quiz.options,
          quiz.answer
        );
        return quiz;
    }
  } else {
    // 表からクイズデータの読み込み
    const sheet = SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetById(0);
    if (!sheet) { return { examType: '', question: '', options: [], answer: -1 }; }
    const lastRow = sheet.getLastRow() - 1;
    const tableData = sheet.getRange(2, 1, lastRow, 8).getValues();

    // 表データをクイズデータに変換
    /** @type {{ examType: string; question: string; options: string[]; answer: number; }[]} */
    const quizData = [];
    for (let row of tableData) {
      quizData.push({
        examType: row[1],
        question: row[2],
        options: [...row.slice(3, 7)],
        answer: row[7],
      });
    }

    const idx = Math.floor(Math.random() * quizData.length);
    return quizData[idx];
  }

  return { examType: '', question: '', options: [], answer: -1 };
}

