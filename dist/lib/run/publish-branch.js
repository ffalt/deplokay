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
exports.PublishToBranchRun = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const __1 = require("..");
const utils_1 = require("../utils");
const run_base_1 = require("./run-base");
const SimpleGit = require('simple-git/promise');
class PublishToBranchRun extends run_base_1.Run {
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const version = yield utils_1.getManifestVersion(opts.GIT_DIR);
            if (version === null) {
                return Promise.reject(`Version from package.json could not be read. Exiting...`);
            }
            const sourcegit = new SimpleGit(opts.GIT_DIR);
            sourcegit.outputHandler((command, stdout, stderr) => {
                stdout.on('data', (data) => {
                    this.emit(__1.EmitType.LOG, '', data.toString());
                });
            });
            yield sourcegit.pull();
            const tags = yield sourcegit.tags();
            if (tags.all.indexOf(version) >= 0) {
                yield this.emit(__1.EmitType.DONE, 'done', `Version ${version} is already released. Exiting...`);
                return;
            }
            const exists = yield fs_extra_1.default.pathExists(opts.RELEASE_DIR);
            if (exists) {
                yield this.emit(__1.EmitType.OPERATION, 'cleaning', `Cleaning up ${opts.RELEASE_DIR}`);
                yield fs_extra_1.default.remove(opts.RELEASE_DIR);
            }
            yield this.emit(__1.EmitType.OPERATION, 'cloning', `Cloning to ${opts.RELEASE_DIR}`);
            const destgit = yield utils_1.cloneLocalGit(sourcegit, opts.GIT_DIR, opts.RELEASE_DIR);
            destgit.outputHandler((command, stdout, stderr) => {
                stdout.on('data', (data) => {
                    this.emit(__1.EmitType.LOG, '', data.toString());
                });
            });
            const hasBranch = yield utils_1.hasRemoteBranch(destgit, opts.RELEASE_BRANCH);
            if (hasBranch) {
                yield this.emit(__1.EmitType.OPERATION, 'checkout', `Checkout Release Branch ${opts.RELEASE_BRANCH}`);
                yield utils_1.checkoutRemoteBranch(destgit, opts.RELEASE_BRANCH);
            }
            else {
                yield this.emit(__1.EmitType.OPERATION, 'creating', `Creating Release Branch ${opts.RELEASE_BRANCH}`);
                yield utils_1.createAndPushEmptyBranch(destgit, opts.RELEASE_DIR, opts.RELEASE_BRANCH);
            }
            yield destgit.rm(['-rf', '.']);
            yield this.emit(__1.EmitType.OPERATION, 'copying', `Copy dist ${opts.SOURCE_DIR} to ${opts.RELEASE_DIR}`);
            yield fs_extra_1.default.copy(opts.SOURCE_DIR, opts.RELEASE_DIR);
            yield this.emit(__1.EmitType.OPERATION, 'commiting', `Commit Version ${version}`);
            yield destgit.add('.');
            yield destgit.commit(version);
            if (!opts.DISABLE_TAG) {
                yield this.emit(__1.EmitType.OPERATION, 'tagging', `Tag Version ${version}`);
                yield destgit.tag([`v${version}`]);
                yield destgit.push('origin', opts.RELEASE_BRANCH);
                yield destgit.push('origin', '--tags');
            }
            else {
                yield destgit.push('origin', opts.RELEASE_BRANCH);
            }
            yield this.emit(__1.EmitType.OPERATION, 'cleaning', `Cleaning up ${opts.RELEASE_DIR}`);
            yield fs_extra_1.default.remove(opts.RELEASE_DIR);
        });
    }
}
exports.PublishToBranchRun = PublishToBranchRun;
//# sourceMappingURL=publish-branch.js.map