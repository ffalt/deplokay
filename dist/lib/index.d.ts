export declare enum EmitType {
    ERROR = 0,
    OPERATION = 1,
    SUCCESS = 2,
    DONE = 3,
    FINISH = 4
}
export declare type EmitFunction = (task: any, type: EmitType, state: string, details: string) => Promise<void>;
