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
const fs_extra_1 = __importDefault(require("fs-extra"));
const __1 = require("..");
const run_base_1 = require("./run-base");
const SimpleGit = require('simple-git/promise');
class GitFolderRun extends run_base_1.Run {
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.mkdirp(opts.GIT_DIR);
            let exists = yield fs_extra_1.default.pathExists(opts.GIT_DIR);
            if (!exists) {
                return Promise.reject(`Directory ${opts.GIT_DIR} must exist`);
            }
            const git = new SimpleGit(opts.GIT_DIR);
            git.outputHandler((command, stdout, stderr) => {
                stdout.on('data', (data) => {
                    this.emit(__1.EmitType.LOG, '', data.toString());
                });
            });
            exists = yield fs_extra_1.default.pathExists(path_1.default.resolve(opts.GIT_DIR, '.git'));
            if (!exists) {
                yield this.emit(__1.EmitType.OPERATION, 'cloning', `Cloning repo ${opts.GIT_REPO} to ${opts.GIT_DIR}`);
                yield git.clone(opts.GIT_REPO, opts.GIT_DIR);
                const branches = yield git.branch([]);
                if (branches.current !== opts.GIT_BRANCH) {
                    yield this.emit(__1.EmitType.OPERATION, 'checkout', `Checkout Branch ${opts.GIT_BRANCH}`);
                    yield git.checkoutBranch(opts.GIT_BRANCH, 'origin/' + opts.GIT_BRANCH);
                }
            }
            try {
                yield this.emit(__1.EmitType.OPERATION, 'updating', `Pulling ${opts.GIT_REPO} Branch ${opts.GIT_BRANCH}`);
                yield git.pull('origin', opts.GIT_BRANCH);
            }
            catch (e) {
                yield this.emit(__1.EmitType.OPERATION, 'resetting', `Resetting ${opts.GIT_DIR} Branch ${opts.GIT_BRANCH}`);
                yield git.reset(['--hard', 'origin/' + opts.GIT_BRANCH]);
                yield this.emit(__1.EmitType.OPERATION, 'updating', `Pulling ${opts.GIT_REPO} Branch ${opts.GIT_BRANCH}`);
                yield git.pull('origin', opts.GIT_BRANCH);
            }
        });
    }
}
exports.GitFolderRun = GitFolderRun;
//# sourceMappingURL=git-folder.js.map