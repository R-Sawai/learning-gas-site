
interface GoogleScriptRun {
    [funcName: string]: (...args: any[]) => GoogleScriptRun;
    withSuccessHandler: (callback: (result: any) => void, cls: typeof GasClientBase) => GoogleScriptRun;
    withFailureHandler: (callback: (error: any) => void, cls: typeof GasClientBase) => GoogleScriptRun;
}

class GasClientBase {
    protected static successHandler: (result: any) => void;
    protected static failureHandler: (error: any) => void;
    protected static tryEval(func: (...args: any[]) => any, cls: typeof GasClientBase = GasClientBase, ...args: any[]) {
        try {
            cls.successHandler(func(...args));
        } catch (error) {
            cls.failureHandler(error);
        }
        return cls.script.run;
    }

    static script: { run: GoogleScriptRun } = {
        run: {
            withSuccessHandler: (callback: (result: any) => void, cls: typeof GasClientBase) => {
                cls.successHandler = callback;
                return cls.script.run;
            },
            withFailureHandler: (callback: (error: any) => void, cls: typeof GasClientBase) => {
                cls.failureHandler = callback;
                return cls.script.run;
            },
        }
    };
}


export class GasClientTest extends GasClientBase {
    static script = {
        run: {
            withSuccessHandler: (callback: (result: any) => void) => super.script.run.withSuccessHandler(callback, this),
            withFailureHandler: (callback: (error: any) => void) => super.script.run.withFailureHandler(callback, this),
            getQuizData: (amount: number) => this.tryEval(this.getQuizData, this, amount),
        }
    };

    private static getQuizData(amount: number) {
        console.log(amount);
        return {
            "question": "HTMLの略は？",
            "options": [
                "Hyper Trainer Marking Language",
                "Hyper Text Markup Language",
                "High Text Machine Language",
                "Hyper Text Markdown Language"
            ],
            "answer": 1
        };
    }
}
