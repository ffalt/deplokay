import { EmitFunction, EmitType } from '..';
export declare abstract class Run<T> {
    private emitter;
    private task;
    constructor(emitter: EmitFunction, task: any);
    emit(type: EmitType, state: string, details: string): Promise<void>;
    abstract run(opts: T): Promise<void>;
}
