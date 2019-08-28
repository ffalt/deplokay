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
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = require("../utils");
const run_base_1 = require("./run-base");
const download_1 = __importDefault(require("download"));
const index_1 = require("../index");
const consts_1 = require("../../consts");
class BuildHugoRun extends run_base_1.Run {
    build(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(index_1.EmitType.OPERATION, 'building', `Building Hugo ${opts.BUILD_SOURCE_DIR}`);
            const exec_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: utils_1.buildEnv(opts.BUILD_ENV)
            };
            const hugo = path_1.default.resolve(opts.BUILD_SOURCE_DIR, './.hugo/hugo') + (process.platform === 'win32' ? '.exe' : '');
            yield utils_1.shellSpawn(hugo, ['-d', opts.BUILD_DEST_DIR], exec_options, (s) => {
                this.emit(index_1.EmitType.LOG, '', s);
            });
            yield this.emit(index_1.EmitType.SUCCESS, 'build', '');
        });
    }
    download(url, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const hugo_dir = path_1.default.resolve(opts.BUILD_SOURCE_DIR, '.hugo');
            yield fs_extra_1.default.ensureDir(hugo_dir);
            yield this.emit(index_1.EmitType.OPERATION, 'installing', `Installing Hugo ${opts.BUILD_EXTENDED ? 'extended ' : ''}into ${hugo_dir}`);
            yield download_1.default(url, hugo_dir, { extract: true });
            yield this.emit(index_1.EmitType.SUCCESS, 'installed', '');
        });
    }
    installSimple(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const version = opts.BUILD_VERSION || consts_1.DEFAULT_HUGO_VERSION;
            const osData = {
                'win32': 'Windows',
                'linux': 'Linux',
                'freebsd': 'FreeBSD',
                'darwin': 'macOS'
            };
            const osArch = {
                'x64': '64bit',
                'x86': '32bit',
                'arm': 'ARM',
                'arm64': 'ARM64'
            };
            if (!osData[process.platform] || !osArch[process.arch]) {
                return Promise.reject('Your system is not supported :.(');
            }
            const githubReleaseUrl = `https://github.com/gohugoio/hugo/releases/download/v${version}/`;
            const ext = process.platform === 'win32' ? 'zip' : 'tar.gz';
            const url = `${githubReleaseUrl}hugo_${version}_${osData[process.platform]}-${osArch[process.arch]}.${ext}`;
            yield this.download(url, opts);
        });
    }
    installExtended(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const version = opts.BUILD_VERSION;
            const osData = {
                'win32': 'Windows',
                'linux': 'Linux',
                'darwin': 'macOS'
            };
            if (!osData[process.platform] || process.arch !== 'x64') {
                return Promise.reject('Your system is not supported :.(');
            }
            const githubReleaseUrl = `https://github.com/gohugoio/hugo/releases/download/v${version}/`;
            const ext = process.platform === 'win32' ? 'zip' : 'tar.gz';
            const url = `${githubReleaseUrl}hugo_extended_${version}_${osData[process.platform]}-64bit.${ext}`;
            yield this.download(url, opts);
        });
    }
    install(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (opts.BUILD_EXTENDED) {
                return this.installExtended(opts);
            }
            else {
                return this.installSimple(opts);
            }
        });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const hugo_dir = path_1.default.resolve(opts.BUILD_SOURCE_DIR, '.hugo');
            const exists = yield fs_extra_1.default.pathExists(hugo_dir);
            if (!exists) {
                yield this.install(opts);
            }
            try {
                return yield this.build(opts);
            }
            catch (e) {
                yield this.install(opts);
                return yield this.build(opts);
            }
        });
    }
}
exports.BuildHugoRun = BuildHugoRun;
//# sourceMappingURL=build-hugo.js.map