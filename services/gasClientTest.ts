import { GasClientBase, type GoogleScriptRun } from "./gasClient";


export class GasClientTest extends GasClientBase {
    public get script(): { run: GoogleScriptRun } {
        return this.#script;
    }

    #script = {
        run: {
            ...super.script.run,
            getQuizData: (amount: number) => this.tryEval(this.getQuizData, amount),
        }
    };

    private getQuizData(_amount: number) {
        const questions = [{ question: "HTMLの略は？", options: ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "High Text Machine Language", "Hyper Text Markdown Language"], answer: 1 }, { "question": "JavaScriptで変数を宣言する方法は？", "options": ["var", "let", "const", "すべて正しい"], "answer": 3 }, { "question": "CSSの役割は？", "options": ["データの保存", "ページの構造設計", "見た目の装飾", "Webサーバー構築"], "answer": 2 }, { "question": "Reactは何？", "options": ["DB", "ブラウザ", "JSフレームワーク", "画像編集ソフト"], "answer": 2 }, { "question": "Gitのcloneの意味は？", "options": ["ブランチを切る", "プルリクを送る", "リポジトリをコピー", "履歴を削除"], "answer": 2 }, { "question": "HTTPは何の略？", "options": ["Hyper Text Transfer Protocol", "Hyper Tool Transfer Protocol", "Host Transfer Text Protocol", "None"], "answer": 0 }, { "question": "JavaScriptで関数を作るには？", "options": ["func()", "define()", "function", "create()"], "answer": 2 }, { "question": "フロントエンドのライブラリは？", "options": ["Django", "Flask", "Laravel", "Vue.js"], "answer": 3 }, { "question": "Tailwind CSSの特徴は？", "options": ["ユーティリティファースト", "AIベース", "バックエンド統合", "無限スクロール特化"], "answer": 0 }, { "question": "HTMLでリンクを作るタグは？", "options": ["<div>", "<span>", "<a>", "<link>"], "answer": 2 }] as const;
        const idx = Math.floor(Math.random() * questions.length);
        return questions[idx];
    }
}