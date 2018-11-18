import program from 'commander';
import { EmitType } from '../lib/index';
import { PublishActionOptions } from '../lib/action/action-base';
export declare class DeplokayCLI {
    protected emit(task: {
        id: string;
    }, type: EmitType, state: string, details: string): Promise<void>;
    protected programOptions(prog: program.CommanderStatic): void;
    protected cliOptions(prog: program.CommanderStatic): PublishActionOptions;
    protected run(opts: PublishActionOptions): Promise<void>;
    protected start(): Promise<void>;
    main(): void;
}
