
export interface GoogleScriptRun {
    [funcName: string]: (...args: any[]) => GoogleScriptRun;
    withSuccessHandler: (callback: (result: any) => void) => GoogleScriptRun;
    withFailureHandler: (callback: (error: any) => void) => GoogleScriptRun;
}

export class GasClientBase {
    protected successHandler: (result: any) => void = () => { };
    protected failureHandler: (error: any) => void = () => { };
    protected tryEval(func: (...args: any[]) => any, ...args: any[]) {
        try {
            this.successHandler(func(...args));
        } catch (error) {
            this.failureHandler(error);
        }
        return this.script.run;
    }


    public get script(): { run: GoogleScriptRun } {
        return this.#script;
    }

    #script: { run: GoogleScriptRun } = {
        run: {
            withSuccessHandler: (callback: (result: any) => void) => {
                this.successHandler = callback;
                return this.script.run;
            },
            withFailureHandler: (callback: (error: any) => void) => {
                this.failureHandler = callback;
                return this.script.run;
            },
        }
    };
}

