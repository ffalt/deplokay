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
const action_base_1 = require("./action-base");
const build_hugo_1 = require("../run/build-hugo");
const consts_1 = require("../../consts");
class HugoPublishAction extends action_base_1.PublishActionBase {
    runHugo(build_path) {
        return __awaiter(this, void 0, void 0, function* () {
            const hugoOptions = {
                BUILD_SOURCE_DIR: build_path,
                BUILD_DEST_DIR: path_1.default.resolve(build_path, '_site'),
                BUILD_VERSION: this.opts.build && this.opts.build.hugo && this.opts.build.hugo.version ? this.opts.build.hugo.version : consts_1.DEFAULT_HUGO_VERSION,
                BUILD_EXTENDED: this.opts.build && this.opts.build.hugo && this.opts.build.hugo.extended !== undefined ? this.opts.build.hugo.extended : false,
                BUILD_ENV: this.opts.env
            };
            const hugo = new build_hugo_1.BuildHugoRun(this.emit, this.task);
            yield hugo.run(hugoOptions);
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateOptions();
            const { build_path, version, name } = yield this.runSource();
            yield this.runHugo(build_path);
            yield this.runPublish(build_path, path_1.default.resolve(build_path, '_site'), name, version);
        });
    }
}
exports.HugoPublishAction = HugoPublishAction;
//# sourceMappingURL=hugo-git-publish.js.map