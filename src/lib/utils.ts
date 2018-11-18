import simplegit from 'simple-git/promise';
import path from 'path';
import util from 'util';
import fse from 'fs-extra';
import semver from 'semver';
import {EmitType} from './index';
import {BuildHugoOptions} from './run/build-hugo';

const SimpleGit = require('simple-git/promise');
const exec = util.promisify(require('child_process').exec);

export async function cloneLocalGit(git: simplegit.SimpleGit, sourceDir: string, destDir: string): Promise<simplegit.SimpleGit> {
	const remoteUrl = await getRemoteUrl(git);
	await git.raw(['clone', sourceDir, destDir]);
	const destgit = new SimpleGit(destDir);
	await setRemoteUrl(destgit, remoteUrl);
	return destgit;
}

export async function getRemoteUrl(git: simplegit.SimpleGit): Promise<string> {
	return (await git.raw(['config', '--get', 'remote.origin.url'])).split('\n')[0];
}

export async function setRemoteUrl(git: simplegit.SimpleGit, url: string): Promise<void> {
	await git.raw(['remote', 'set-url', 'origin', url]);
}

export async function hasRemoteBranch(git: simplegit.SimpleGit, branch: string): Promise<boolean> {
	const branches = await git.listRemote(['-h', 'origin']);
	const re = new RegExp(`heads\\/${branch}$`, 'm');
	return re.test(branches);
}

export async function checkoutRemoteBranch(git: simplegit.SimpleGit, branch: string): Promise<void> {
	await git.fetch(['-f', 'origin', `${branch}:${branch}`]);
	await git.checkout(branch);
}

export async function createAndPushEmptyBranch(git: simplegit.SimpleGit, destDir: string, branch: string): Promise<void> {
	await git.raw(['checkout', '--orphan', branch]);
	await git.rm(['-rf', '.']);
	await fse.writeFile(path.resolve(destDir, 'README.md'), '#Releases');
	await git.add('README.md');
	await git.commit('Create Releases Branch');
	await git.raw(['push', '-u', 'origin', branch]);
}

export async function runBuild(buildCmd: string, buildDir: string): Promise<{ stdout: string, stderr: string }> {
	return await shellExec(`npm run ${buildCmd}`, {cwd: buildDir});
}

export async function getGitSummary(gitDir: string): Promise<{ version: string; name: string; }> {
	const git = new SimpleGit(gitDir);
	git.silent(true);
	let version: string | null = null;
	let name: string | null = null;
	try {
		const data = await git.show(['HEAD:package.json']);
		if (data) {
			const manifest = JSON.parse(data);
			version = semver.clean(manifest.version);
			name = manifest.name;
		}
	} catch (e) {
	}
	if (!version) {
		version = await git.revparse(['HEAD']);
	}
	if (!version) {
		version = Date.now().toString();
	}
	if (!name) {
		name = path.basename(gitDir);
	}
	return {version: version.trim(), name: name.trim()};
}

export interface ShellExecOptions {
	cwd: string;
	env?: { [name: string]: any };
}

export async function getManifest(dir: string, skipSemverClean?: boolean): Promise<any> {
	const manifest = await fse.readJson(path.resolve(dir, 'package.json'));
	if (!skipSemverClean) {
		manifest.version = semver.clean(manifest.version);
	}
	return manifest;
}

export async function getManifestVersion(dir: string): Promise<string> {
	const manifest = await getManifest(dir);
	return manifest.version;
}

export async function shellExec(cmd: string, options: ShellExecOptions): Promise<{ stdout: string, stderr: string }> {
	const {stdout, stderr, error} = await exec(cmd, options);
	if (error) {
		throw new Error(error);
	}
	return {stderr: (stderr || '').trim(), stdout: (stdout || '').trim()};
}

export function buildEnv(envExtra?: { [name: string]: string }): { [name: string]: any } {
	if (!envExtra) {
		return process.env;
	}
	const envSrc = process.env;
	const result: { [name: string]: any } = {};
	Object.keys(envSrc).forEach((key) => result[key] = envSrc[key]);
	Object.keys(envExtra).forEach((key) => result[key] = envExtra[key]);
	return result;
}
