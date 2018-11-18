"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const semver_1 = __importDefault(require("semver"));
const SimpleGit = require('simple-git/promise');
const exec = util_1.default.promisify(require('child_process').exec);
function cloneLocalGit(git, sourceDir, destDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const remoteUrl = yield getRemoteUrl(git);
        yield git.raw(['clone', sourceDir, destDir]);
        const destgit = new SimpleGit(destDir);
        yield setRemoteUrl(destgit, remoteUrl);
        return destgit;
    });
}
exports.cloneLocalGit = cloneLocalGit;
function getRemoteUrl(git) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield git.raw(['config', '--get', 'remote.origin.url'])).split('\n')[0];
    });
}
exports.getRemoteUrl = getRemoteUrl;
function setRemoteUrl(git, url) {
    return __awaiter(this, void 0, void 0, function* () {
        yield git.raw(['remote', 'set-url', 'origin', url]);
    });
}
exports.setRemoteUrl = setRemoteUrl;
function hasRemoteBranch(git, branch) {
    return __awaiter(this, void 0, void 0, function* () {
        const branches = yield git.listRemote(['-h', 'origin']);
        const re = new RegExp(`heads\\/${branch}$`, 'm');
        return re.test(branches);
    });
}
exports.hasRemoteBranch = hasRemoteBranch;
function checkoutRemoteBranch(git, branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield git.fetch(['-f', 'origin', `${branch}:${branch}`]);
        yield git.checkout(branch);
    });
}
exports.checkoutRemoteBranch = checkoutRemoteBranch;
function createAndPushEmptyBranch(git, destDir, branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield git.raw(['checkout', '--orphan', branch]);
        yield git.rm(['-rf', '.']);
        yield fs_extra_1.default.writeFile(path_1.default.resolve(destDir, 'README.md'), '#Releases');
        yield git.add('README.md');
        yield git.commit('Create Releases Branch');
        yield git.raw(['push', '-u', 'origin', branch]);
    });
}
exports.createAndPushEmptyBranch = createAndPushEmptyBranch;
function runBuild(buildCmd, buildDir) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield shellExec(`npm run ${buildCmd}`, { cwd: buildDir });
    });
}
exports.runBuild = runBuild;
function getGitSummary(gitDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = new SimpleGit(gitDir);
        git.silent(true);
        let version = null;
        let name = null;
        try {
            const data = yield git.show(['HEAD:package.json']);
            if (data) {
                const manifest = JSON.parse(data);
                version = semver_1.default.clean(manifest.version);
                name = manifest.name;
            }
        }
        catch (e) {
        }
        if (!version) {
            version = yield git.revparse(['HEAD']);
        }
        if (!version) {
            version = Date.now().toString();
        }
        if (!name) {
            name = path_1.default.basename(gitDir);
        }
        return { version: version.trim(), name: name.trim() };
    });
}
exports.getGitSummary = getGitSummary;
function getManifest(dir, skipSemverClean) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = yield fs_extra_1.default.readJson(path_1.default.resolve(dir, 'package.json'));
        if (!skipSemverClean) {
            manifest.version = semver_1.default.clean(manifest.version);
        }
        return manifest;
    });
}
exports.getManifest = getManifest;
function getManifestVersion(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = yield getManifest(dir);
        return manifest.version;
    });
}
exports.getManifestVersion = getManifestVersion;
function shellExec(cmd, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { stdout, stderr, error } = yield exec(cmd, options);
        if (error) {
            throw new Error(error);
        }
        return { stderr: (stderr || '').trim(), stdout: (stdout || '').trim() };
    });
}
exports.shellExec = shellExec;
function buildEnv(envExtra) {
    if (!envExtra) {
        return process.env;
    }
    const envSrc = process.env;
    const result = {};
    Object.keys(envSrc).forEach((key) => result[key] = envSrc[key]);
    Object.keys(envExtra).forEach((key) => result[key] = envExtra[key]);
    return result;
}
exports.buildEnv = buildEnv;
//# sourceMappingURL=utils.js.map