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
const build_jekyll_1 = require("../run/build-jekyll");
const action_base_1 = require("./action-base");
class JekyllPublishAction extends action_base_1.PublishActionBase {
    runJekyll(build_path) {
        return __awaiter(this, void 0, void 0, function* () {
            const jekyllOptions = {
                BUILD_SOURCE_DIR: build_path,
                BUILD_DEST_DIR: path_1.default.resolve(build_path, '_site'),
                BUILD_ENV: this.opts.env
            };
            const jekyll = new build_jekyll_1.BuildJekyllRun(this.emit, this.task);
            yield jekyll.run(jekyllOptions);
        });
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateOptions();
            const { build_path, version, name } = yield this.runSource();
            yield this.runJekyll(build_path);
            yield this.runPublish(build_path, path_1.default.resolve(build_path, '_site'), name, version);
        });
    }
}
exports.JekyllPublishAction = JekyllPublishAction;
//# sourceMappingURL=jekyll-git-publish.js.map