import { Run } from './run-base';
export interface BuildNPMOptions {
    BUILD_SOURCE_DIR: string;
    BUILD_CMD: string;
    BUILD_ENV?: {
        [name: string]: string;
    };
}
export declare class BuildNPMRun extends Run<BuildNPMOptions> {
    private buildEnv;
    private build;
    private execute;
    private install;
    run(opts: BuildNPMOptions): Promise<void>;
}
