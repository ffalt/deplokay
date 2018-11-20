export declare enum EmitType {
    ERROR = 0,
    OPERATION = 1,
    LOG = 2,
    SUCCESS = 3,
    DONE = 4,
    FINISH = 5
}
export declare type EmitFunction = (task: any, type: EmitType, state: string, details: string) => Promise<void>;
