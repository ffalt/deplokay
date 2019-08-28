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
const __1 = require("..");
const fs_extra_1 = __importDefault(require("fs-extra"));
const run_base_1 = require("./run-base");
const archiver_1 = __importDefault(require("archiver"));
class PublishToArchiveRun extends run_base_1.Run {
    archive(sourceDir, destfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = fs_extra_1.default.createWriteStream(destfile);
            const archive = archiver_1.default('zip', { zlib: { level: 9 } });
            return new Promise((resolve, reject) => {
                output.on('close', () => resolve(archive.pointer()));
                archive.on('warning', err => {
                    if (err.code === 'ENOENT') {
                    }
                    else {
                        throw err;
                    }
                });
                archive.on('error', err => {
                    throw err;
                });
                archive.pipe(output);
                archive.directory(sourceDir, false);
                archive.finalize();
            });
        });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const exists = yield fs_extra_1.default.pathExists(opts.SOURCE_DIR);
            if (!exists) {
                return Promise.reject(`Publishing source path does not exists ${opts.SOURCE_DIR}`);
            }
            yield fs_extra_1.default.ensureDir(opts.ARCHIVE_DIR);
            const destfile = `${opts.ARCHIVE_DIR}/${opts.NAME}-${opts.VERSION}.zip`;
            const size = yield this.archive(opts.SOURCE_DIR, destfile);
            yield this.emit(__1.EmitType.DONE, 'published', `Published to ${destfile} - ${size} bytes`);
        });
    }
}
exports.PublishToArchiveRun = PublishToArchiveRun;
//# sourceMappingURL=publish-archive.js.map