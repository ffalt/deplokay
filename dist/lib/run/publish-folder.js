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
exports.PublishToFolderRun = void 0;
const __1 = require("..");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const run_base_1 = require("./run-base");
class PublishToFolderRun extends run_base_1.Run {
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            opts = Object.assign({}, opts);
            let exists = yield fs_extra_1.default.pathExists(opts.SOURCE_DIR);
            if (!exists) {
                return Promise.reject(`Publishing source path does not exists ${opts.SOURCE_DIR}`);
            }
            const tmp_dest_dir = path_1.default.resolve(opts.PUBLISH_DIR + '_backup');
            exists = yield fs_extra_1.default.pathExists(opts.PUBLISH_DIR);
            if (exists) {
                yield this.emit(__1.EmitType.OPERATION, 'storing', `Backing up ${opts.PUBLISH_DIR}`);
                yield fs_extra_1.default.move(opts.PUBLISH_DIR, tmp_dest_dir);
            }
            try {
                yield this.emit(__1.EmitType.OPERATION, 'publishing', `Publishing to ${opts.PUBLISH_DIR}`);
                yield fs_extra_1.default.copy(opts.SOURCE_DIR, opts.PUBLISH_DIR);
            }
            catch (e) {
                yield fs_extra_1.default.move(tmp_dest_dir, opts.PUBLISH_DIR);
                return Promise.reject(e);
            }
            yield this.emit(__1.EmitType.OPERATION, 'cleaning', `Removing backup ${tmp_dest_dir}`);
            yield fs_extra_1.default.remove(tmp_dest_dir);
            yield this.emit(__1.EmitType.DONE, 'published', `Published to ${opts.PUBLISH_DIR}`);
        });
    }
}
exports.PublishToFolderRun = PublishToFolderRun;
//# sourceMappingURL=publish-folder.js.map