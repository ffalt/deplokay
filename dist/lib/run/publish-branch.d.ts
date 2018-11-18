import { Run } from './run-base';
export interface PublishToBranchRunOptions {
    GIT_DIR: string;
    SOURCE_DIR: string;
    RELEASE_DIR: string;
    RELEASE_BRANCH: string;
}
export declare class PublishToBranchRun extends Run<PublishToBranchRunOptions> {
    isUpdateNeeded(opts: PublishToBranchRunOptions): Promise<{
        needed: boolean;
        version: string;
    }>;
    run(opts: PublishToBranchRunOptions): Promise<void>;
}
