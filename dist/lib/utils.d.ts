/// <reference types="node" />
import simplegit from 'simple-git/promise';
import { SpawnOptions } from 'child_process';
export declare function cloneLocalGit(git: simplegit.SimpleGit, sourceDir: string, destDir: string): Promise<simplegit.SimpleGit>;
export declare function getRemoteUrl(git: simplegit.SimpleGit): Promise<string>;
export declare function setRemoteUrl(git: simplegit.SimpleGit, url: string): Promise<void>;
export declare function hasRemoteBranch(git: simplegit.SimpleGit, branch: string): Promise<boolean>;
export declare function checkoutRemoteBranch(git: simplegit.SimpleGit, branch: string): Promise<void>;
export declare function createAndPushEmptyBranch(git: simplegit.SimpleGit, destDir: string, branch: string): Promise<void>;
export declare function getGitSummary(gitDir: string): Promise<{
    version: string;
    name: string;
}>;
export declare function getManifest(dir: string, skipSemverClean?: boolean): Promise<any>;
export declare function getManifestVersion(dir: string): Promise<string>;
export declare function shellSpawn(cmd: string, args: Array<string>, options: SpawnOptions, onDataLine: (s: string) => void): Promise<void>;
export declare function buildEnv(envExtra?: {
    [name: string]: string;
}): {
    [name: string]: any;
};
