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
const __1 = require("..");
const utils_1 = require("../utils");
const run_base_1 = require("./run-base");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class CombineReleaseRun extends run_base_1.Run {
    configureNPMJson(soureDir, destDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const manifest = yield utils_1.getManifest(soureDir, true);
            yield this.emit(__1.EmitType.OPERATION, 'writing', `Writing ${'package.json'}`);
            delete manifest.devDependencies;
            yield fs_extra_1.default.writeFile(path_1.default.resolve(destDir, 'package.json'), JSON.stringify(manifest, null, '\t'));
            yield this.emit(__1.EmitType.OPERATION, 'generating', `Generating ${'package-lock.json'}`);
            yield utils_1.shellSpawn('npm', ['install', '--production', '--no-color', '-no-audit'], { cwd: destDir }, (s) => {
                this.emit(__1.EmitType.LOG, '', s);
            });
            yield this.emit(__1.EmitType.SUCCESS, 'generating', '');
            yield fs_extra_1.default.remove(path_1.default.resolve(destDir, 'node_modules'));
        });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(__1.EmitType.OPERATION, 'generating', `Generating release folder ${opts.RELEASE_DIR}`);
            const copied = [];
            if (opts.FOLDERS && opts.FOLDERS.length > 0) {
                for (const entry of opts.FOLDERS) {
                    const list = yield fs_extra_1.default.readdir(path_1.default.resolve(opts.SOURCE_DIR, entry));
                    for (const subentry of list) {
                        yield fs_extra_1.default.copy(path_1.default.resolve(opts.SOURCE_DIR, entry, subentry), path_1.default.resolve(opts.RELEASE_DIR, subentry));
                        copied.push(subentry);
                        yield this.emit(__1.EmitType.LOG, '', subentry);
                    }
                }
            }
            if (opts.COMPONENTS && opts.COMPONENTS.length > 0) {
                for (const entry of opts.COMPONENTS) {
                    yield this.emit(__1.EmitType.OPERATION, 'copying', `Copying component ${entry}`);
                    yield fs_extra_1.default.copy(path_1.default.resolve(opts.SOURCE_DIR, entry), path_1.default.resolve(opts.RELEASE_DIR, entry));
                    copied.push(entry);
                    yield this.emit(__1.EmitType.LOG, '', entry);
                }
            }
            if (copied.length === 0) {
                return Promise.reject('Release folder is empty.');
            }
            else {
                if (opts.GENERATE_SLIM_PACKAGE) {
                    yield this.configureNPMJson(opts.SOURCE_DIR, opts.RELEASE_DIR);
                }
                yield this.emit(__1.EmitType.SUCCESS, 'generated', '');
            }
        });
    }
}
exports.CombineReleaseRun = CombineReleaseRun;
//# sourceMappingURL=combine-release.js.map