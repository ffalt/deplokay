import { Run } from './run-base';
export interface BuildHugoOptions {
    BUILD_SOURCE_DIR: string;
    BUILD_DEST_DIR: string;
    BUILD_ENV?: {
        [name: string]: string;
    };
    BUILD_VERSION: string;
    BUILD_EXTENDED: boolean;
}
export declare class BuildHugoRun extends Run<BuildHugoOptions> {
    private build;
    private download;
    private installSimple;
    private installExtended;
    private install;
    run(opts: BuildHugoOptions): Promise<void>;
}
