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
exports.NPMPublishAction = void 0;
const path_1 = __importDefault(require("path"));
const build_npm_1 = require("../run/build-npm");
const action_base_1 = require("./action-base");
const utils_1 = require("../utils");
const tmp_promise_1 = __importDefault(require("tmp-promise"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const combine_release_1 = require("../run/combine-release");
class NPMPublishAction extends action_base_1.PublishActionBase {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateOptions();
            const { build_path } = yield this.runSource();
            const manifest = yield utils_1.getManifest(build_path);
            if (manifest.version === null) {
                return Promise.reject(`Version from package.json could not be read. Exiting...`);
            }
            const npmRunOptions = {
                BUILD_SOURCE_DIR: path_1.default.resolve(build_path),
                BUILD_CMD: this.opts.build && this.opts.build.npm && this.opts.build.npm.cmd_name ? this.opts.build.npm.cmd_name : '',
                BUILD_ENV: this.opts.env
            };
            const npm = new build_npm_1.BuildNPMRun(this.emit, this.task);
            yield npm.run(npmRunOptions);
            const release_tmp = yield tmp_promise_1.default.dir();
            try {
                const combineReleaseOptions = {
                    SOURCE_DIR: build_path,
                    RELEASE_DIR: release_tmp.path,
                    FOLDERS: this.opts.build && this.opts.build.npm && this.opts.build.npm.folder_names ? this.opts.build.npm.folder_names : [],
                    COMPONENTS: this.opts.build && this.opts.build.npm && this.opts.build.npm.component_names ? this.opts.build.npm.component_names : [],
                    GENERATE_SLIM_PACKAGE: this.opts.build && this.opts.build.npm && (this.opts.build.npm.slim_package !== undefined) ? this.opts.build.npm.slim_package : false,
                    BUILD_ENV: this.opts.env
                };
                const combine = new combine_release_1.CombineReleaseRun(this.emit, this.task);
                yield combine.run(combineReleaseOptions);
                yield this.runPublish(build_path, release_tmp.path, manifest.name, manifest.version);
                yield fs_extra_1.default.remove(release_tmp.path);
            }
            catch (e) {
                yield fs_extra_1.default.remove(release_tmp.path);
                return Promise.reject(e);
            }
        });
    }
}
exports.NPMPublishAction = NPMPublishAction;
//# sourceMappingURL=npm-git-publish.js.map