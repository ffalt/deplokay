import { Run } from './run-base';
export interface GitFolderOptions {
    GIT_REPO: string;
    GIT_DIR: string;
    GIT_BRANCH: string;
}
export declare class GitFolderRun extends Run<GitFolderOptions> {
    run(opts: GitFolderOptions): Promise<void>;
}
