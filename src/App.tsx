import { useEffect, useRef, useState, type FC } from 'react';
import { GasClientTest } from '../services/gasClientTest';

let GasClient: GasClientTest;
if (import.meta.env.DEV) {
    GasClient = new GasClientTest();
} else {
    // 本番環境ではGASのgoogleを用いる
    //@ts-ignore
    GasClient = google;
}

/** クイズのデータ型 */
interface QuizDataType {
    /** 試験の種類 */
    examType: string;
    /** 問題 */
    question: string;
    /** 解答群 */
    options: string[];
    /**  解答インデックス */
    answer: number;
}

export const App: FC = () => {

    const MAX_QUIZ_LENGTH = 10;

    const [examType, _setExamType] = useState<'AWS CLF' | 'AWS SAA' | 'GCP CDL' | 'GCP ACE'>('AWS CLF');

    // クイズデータ
    const [quizList, setQuizList] = useState<QuizDataType[] | null>(null);
    // 現在の問題番号
    const [currentIndex, setCurrentIndex] = useState(0);
    // 選択した番号
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    // 正解問題数
    const [score, setScore] = useState(0);
    // 結果を見せるか
    const [isShowResult, setIsShowResult] = useState(false);

    /** 問題をリストに追加します */
    const addQuiz = (quiz: QuizDataType) => {
        setQuizList(prev => (prev) ? [...prev, quiz] : [quiz]);
    };


    /** 
     * クイズ読み込み用Effectが実行されたか
     * （StrictModeによる二重取得を無視するための変数）
     */
    const isEffectedLoadQuiz = useRef(false);
    // クイズデータの取得
    useEffect(() => {
        (async () => {
            if (!isEffectedLoadQuiz.current) {
                const loadQuiz = async () => {
                    await new Promise<void>((res, rej) => {
                        GasClient.script.run
                            .withSuccessHandler(result => {
                                if (!result) { return; }
                                const quiz: QuizDataType = {
                                    examType: result.examType ?? '',
                                    question: result.question ?? '',
                                    options: result.options ?? [],
                                    answer: result.answer ?? -1,
                                };
                                addQuiz(quiz);
                                res();
                            })
                            .withFailureHandler(rej)
                            .getQuizData(examType);
                    });
                };

                for (let i = 0; i < MAX_QUIZ_LENGTH; i++) {
                    await loadQuiz();
                }
            }
        })();

        isEffectedLoadQuiz.current = true;
    }, []);

    // クイズデータが存在しなければロード
    if (!quizList) {
        return (
            <p>読み込み中...</p>
        );
    }

    // 選択肢が押された際のハンドラ
    const handleSelect = (index: number) => {
        // 選択後（not null）は選択できなくする
        if (selectedIndex !== null) { return; }
        setSelectedIndex(index);

        // 回答していたらスコア加算
        if (index === quizList[currentIndex].answer) {
            setScore(score + 1);
        }
    };

    // 次へボタン
    const handleNext = () => {
        const next = currentIndex + 1;
        if (next < quizList.length) {
            // 次の問題があれば、インデックスを加算し選択肢をnullへ
            setCurrentIndex(next);
            setSelectedIndex(null);
        } else {
            // 最後の問題なら結果を表示
            setIsShowResult(true);
        }
    };

    // 結果表示
    if (isShowResult) {
        return (
            <div className="max-w-xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">クイズ終了！</h1>
                <p className="text-xl text-green-600 font-semibold">
                    正解数: {score} / {MAX_QUIZ_LENGTH}
                </p>
            </div>
        );
    }

    const q = quizList[currentIndex];
    const isLoadedAllQuiz = (MAX_QUIZ_LENGTH === quizList.length);
    /** 次へボタンが押せるかの判定 */
    const canPushNext = (isLoadedAllQuiz || (currentIndex !== quizList.length - 1));

    return (
        <div className="w-screen h-screen p-3 bg-gray-100">
            <div className="max-w-md mx-auto p-6 bg-white shadow-xl rounded-xl space-y-6">
                {/* 進行バー */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-[width]" style={{ width: `${currentIndex / MAX_QUIZ_LENGTH * 100}%` }}></div>
                </div>

                {/* 問題文 */}
                <h1 className="text-xl font-bold">
                    {currentIndex + 1}. {q.question}
                </h1>

                {/* 選択肢 */}
                <div className="space-y-4">
                    {q.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={selectedIndex !== null}
                            className={`w-full text-left px-4 py-2 rounded-md shadow transition
                            ${(selectedIndex === i) ? (
                                    (i === q.answer) ? "bg-green-200" : "bg-red-200"
                                ) : (
                                    ((i === q.answer) && (selectedIndex !== null))
                                        ? "bg-green-100"
                                        : "hover:bg-blue-100 bg-gray-100"
                                )}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {/* 選択されていたら次へボタンを表示 */}
                <div className={`text-center ${selectedIndex !== null ? '' : 'hidden'}`}>
                    <button
                        onClick={handleNext}
                        className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                            ${canPushNext ? '' : 'cursor-wait'}`}
                        disabled={!canPushNext}
                    >
                        {(currentIndex === quizList.length - 1) ? (
                            isLoadedAllQuiz ? '結果を見る' : '次へ'
                        ) : '次へ'}
                    </button>
                </div>
            </div>
        </div>
    );
};
