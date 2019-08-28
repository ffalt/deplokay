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
Object.defineProperty(exports, "__esModule", { value: true });
const action_base_1 = require("./action-base");
class CopyPublishAction extends action_base_1.PublishActionBase {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateOptions();
            const { build_path, version, name } = yield this.runSource();
            yield this.runPublish(build_path, build_path, name, version);
        });
    }
}
exports.CopyPublishAction = CopyPublishAction;
//# sourceMappingURL=copy-git-publish.js.map