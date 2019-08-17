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
const publish_branch_1 = require("../run/publish-branch");
const publish_folder_1 = require("../run/publish-folder");
const publish_archive_1 = require("../run/publish-archive");
const git_folder_1 = require("../run/git-folder");
const utils_1 = require("../utils");
class PublishActionBase {
    constructor(opts, task, emit) {
        this.opts = opts;
        this.task = task;
        this.emit = emit;
    }
    validateOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.opts.source) {
                return Promise.reject('Missing Option Node "source": Please provide a source configuration');
            }
            if (!this.opts.source.local && !this.opts.source.remote) {
                return Promise.reject('Missing Options in "source": Please provide a source configuration');
            }
            if (this.opts.source.local && this.opts.source.remote) {
                return Promise.reject('Invalid Options in "source": Please provide only one source configuration');
            }
            if (this.opts.source.local) {
                if (!this.opts.source.local.path) {
                    return Promise.reject('Missing Option "source.local.source_path": Please provide a source configuration');
                }
            }
            if (this.opts.source.remote) {
                if (!this.opts.source.remote.repository) {
                    return Promise.reject('Missing Option "source.remote.repository": Please provide a git repository');
                }
                if (!this.opts.source.remote.branch) {
                    return Promise.reject('Missing Option "source.remote.branch": Please provide a git branch e.g. "master"');
                }
                if (!this.opts.source.remote.checkout_path) {
                    return Promise.reject('Invalid Option "source.remote.checkout_path": Please provide a path where to checkout and build the project');
                }
            }
            if (this.opts.publish) {
                if (this.opts.publish.branch) {
                    if (!this.opts.publish.branch.branch) {
                        return Promise.reject('Missing Option "publish.branch.branch": Please provide a git target branch e.g. "releases"');
                    }
                }
                if (this.opts.publish.folder) {
                    if (!this.opts.publish.folder.path) {
                        return Promise.reject('Invalid Option "publish.folder.path": Please provide a path where to publish the output');
                    }
                }
                if (this.opts.publish.archive) {
                    if (!this.opts.publish.archive.path) {
                        return Promise.reject('Invalid Options "publish.archive.path": Please provide a path where to publish the output archive');
                    }
                }
            }
            if (!this.opts.publish || (!this.opts.publish.branch && !this.opts.publish.folder && !this.opts.publish.archive)) {
                return Promise.reject('Invalid Option "publish.(folder|archive|branch)": Please provide at least one publish option');
            }
            if (!this.opts.build) {
                return Promise.reject('Missing Option "build": Please provide a build option node');
            }
            if (!this.opts.build.npm && !this.opts.build.jekyll && !this.opts.build.hugo && !this.opts.build.copy) {
                return Promise.reject('Invalid Option "build.(jekyll|npm|hugo|copy)": Please provide at least one build mode option');
            }
            if (Object.keys(this.opts.build).length !== 1) {
                return Promise.reject('Invalid Option "build.(mode)": Please provide only one build mode option');
            }
            if (this.opts.build.npm) {
                if (!this.opts.build.npm.cmd_name) {
                    return Promise.reject('Missing Option "build.npm.cmd_name": Please provide a npm build script name e.g. "build:deploy"');
                }
                const parts = (this.opts.build.npm.component_names || []).concat(this.opts.build.npm.folder_names || []);
                if (parts.length === 0) {
                    return Promise.reject('Invalid Options "build.npm.(components|folders)": Please provide at least on element to copy to the release folder e.g. "dist"');
                }
            }
        });
    }
    runSource() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.opts.source.remote) {
                const git = new git_folder_1.GitFolderRun(this.emit, this.task);
                const gitOptions = {
                    GIT_REPO: this.opts.source.remote.repository,
                    GIT_DIR: path_1.default.resolve(this.opts.source.remote.checkout_path),
                    GIT_BRANCH: this.opts.source.remote.branch
                };
                yield git.run(gitOptions);
                const summary = yield utils_1.getGitSummary(path_1.default.resolve(this.opts.source.remote.checkout_path));
                return { build_path: path_1.default.resolve(this.opts.source.remote.checkout_path), version: summary.version, name: summary.name };
            }
            else if (this.opts.source.local) {
                const summary = yield utils_1.getGitSummary(this.opts.source.local.path);
                return { build_path: path_1.default.resolve(this.opts.source.local.path), version: summary.version, name: summary.name };
            }
            else {
                return Promise.reject('Invalid Config');
            }
        });
    }
    runPublish(build_path, dist_path, name, version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.opts.publish) {
                return;
            }
            if (this.opts.publish.branch) {
                const gitBranchOptions = {
                    GIT_DIR: build_path,
                    SOURCE_DIR: dist_path,
                    DISABLE_TAG: !!this.opts.publish.branch.disableTag,
                    RELEASE_DIR: path_1.default.resolve(build_path, '.releases'),
                    RELEASE_BRANCH: this.opts.publish.branch.branch
                };
                const gitBranch = new publish_branch_1.PublishToBranchRun(this.emit, this.task);
                yield gitBranch.run(gitBranchOptions);
            }
            if (this.opts.publish.archive) {
                const archiveOptions = {
                    SOURCE_DIR: dist_path,
                    ARCHIVE_DIR: path_1.default.resolve(this.opts.publish.archive.path),
                    NAME: this.opts.publish.archive.name || name,
                    VERSION: version
                };
                const publish = new publish_archive_1.PublishToArchiveRun(this.emit, this.task);
                yield publish.run(archiveOptions);
            }
            if (this.opts.publish.folder) {
                const publishOptions = {
                    SOURCE_DIR: dist_path,
                    PUBLISH_DIR: path_1.default.resolve(this.opts.publish.folder.path)
                };
                const publish = new publish_folder_1.PublishToFolderRun(this.emit, this.task);
                yield publish.run(publishOptions);
            }
        });
    }
}
exports.PublishActionBase = PublishActionBase;
//# sourceMappingURL=action-base.js.map