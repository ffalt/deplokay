"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const semver_1 = __importDefault(require("semver"));
const child_process_1 = require("child_process");
const SimpleGit = require('simple-git/promise');
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
function shellSpawn(cmd, args, options, onDataLine) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            try {
                const ls = child_process_1.spawn(cmd, args, options);
                let error = '';
                let result = '';
                if (!ls.stdout || !ls.stderr) {
                    throw Error('Spawning shell not supported in this environment');
                }
                ls.stdout.on('data', (data) => {
                    result += data.toString();
                    const sl = result.split('\n');
                    if (sl.length > 1) {
                        for (let i = 0; i < sl.length - 1; i++) {
                            if (sl[i].length > 0) {
                                onDataLine(sl[i]);
                            }
                        }
                        result = sl[sl.length - 1];
                    }
                });
                ls.stderr.on('data', (data) => {
                    error += data.toString();
                });
                ls.on('close', (code) => {
                    if (result.length > 0) {
                        onDataLine(result);
                    }
                    if (code !== 0) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
                ls.on('error', (e) => {
                    reject(e);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
exports.shellSpawn = shellSpawn;
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