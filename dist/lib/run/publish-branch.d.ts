import { Run } from './run-base';
export interface PublishToBranchRunOptions {
    GIT_DIR: string;
    DISABLE_TAG: boolean;
    SOURCE_DIR: string;
    RELEASE_DIR: string;
    RELEASE_BRANCH: string;
}
export declare class PublishToBranchRun extends Run<PublishToBranchRunOptions> {
    run(opts: PublishToBranchRunOptions): Promise<void>;
}
