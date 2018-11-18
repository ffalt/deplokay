import simplegit from 'simple-git/promise';
export declare function cloneLocalGit(git: simplegit.SimpleGit, sourceDir: string, destDir: string): Promise<simplegit.SimpleGit>;
export declare function getRemoteUrl(git: simplegit.SimpleGit): Promise<string>;
export declare function setRemoteUrl(git: simplegit.SimpleGit, url: string): Promise<void>;
export declare function hasRemoteBranch(git: simplegit.SimpleGit, branch: string): Promise<boolean>;
export declare function checkoutRemoteBranch(git: simplegit.SimpleGit, branch: string): Promise<void>;
export declare function createAndPushEmptyBranch(git: simplegit.SimpleGit, destDir: string, branch: string): Promise<void>;
export declare function runBuild(buildCmd: string, buildDir: string): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare function getGitSummary(gitDir: string): Promise<{
    version: string;
    name: string;
}>;
export interface ShellExecOptions {
    cwd: string;
    env?: {
        [name: string]: any;
    };
}
export declare function getManifest(dir: string, skipSemverClean?: boolean): Promise<any>;
export declare function getManifestVersion(dir: string): Promise<string>;
export declare function shellExec(cmd: string, options: ShellExecOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare function buildEnv(envExtra?: {
    [name: string]: string;
}): {
    [name: string]: any;
};
