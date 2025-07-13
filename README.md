# ChatGPTのFunction Callingを活用したアプリケーション
問題をAIに考えてもらい表示するWebアプリケーションです


## 使用技術
- [React](https://ja.react.dev/)：フロントエンド
- [Vite](https://ja.vite.dev/)：React, TypeScriptのビルドツール
- [GoogleAppsScript](https://developers.google.com/apps-script?hl=ja)：サーバー替わり
- [OpenAI API](https://openai.com/ja-JP/api/)：OpenAIの提供するChatGPTが利用できるAPI
- [Google スプレッドシート](https://developers.google.com/workspace/sheets?hl=ja)：データ保存用


## 概要

```mermaid
sequenceDiagram
    participant App.tsx as React App
    participant server.js as GAS Server

    App.tsx->>server.js: getQuizData()
    server.js->>ChatGPT API: POST /chat/completions
    ChatGPT API-->>server.js: 回答（function_call or text）

    alt function_callでappendQuestionが指定されている場合
        server.js->>server.js: appendQuestion()
        server.js->>スプレッドシート: 問題を保存
        server.js-->>App.tsx: quizデータを返す
    else 生成に失敗した場合等
        server.js->>スプレッドシート: 過去データを読み込み
        スプレッドシート-->>server.js: 
        server.js-->>App.tsx: quizデータを返す
    end

    App.tsx ->> App.tsx: quizデータを表示
```