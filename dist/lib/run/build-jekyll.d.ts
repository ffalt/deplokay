import { Run } from './run-base';
export interface BuildJekyllOptions {
    BUILD_SOURCE_DIR: string;
    BUILD_DEST_DIR: string;
    BUILD_ENV?: {
        [name: string]: string;
    };
}
export interface ExecOptions {
    cwd: string;
    env: {
        [name: string]: any;
    };
}
export declare class BuildJekyllRun extends Run<BuildJekyllOptions> {
    private hasBuildErrorMsg;
    private hasInstallErrorMsg;
    private getBundler;
    private build;
    private ensureGemfile;
    private isLegacyBundler;
    private install;
    run(opts: BuildJekyllOptions): Promise<void>;
}
