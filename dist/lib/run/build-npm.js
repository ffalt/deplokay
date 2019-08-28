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
const __1 = require("..");
const utils_1 = require("../utils");
const run_base_1 = require("./run-base");
class BuildNPMRun extends run_base_1.Run {
    buildEnv(opts) {
        const env = Object.assign({ 'NODE_DISABLE_COLORS': 'true' }, opts.BUILD_ENV || {});
        return utils_1.buildEnv(env);
    }
    install(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(__1.EmitType.OPERATION, 'installing', `Installing npm dependencies`);
            const spawn_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: this.buildEnv(opts)
            };
            yield utils_1.shellSpawn('npm', ['install', '--no-color', '-no-audit'], spawn_options, (s) => {
                this.emit(__1.EmitType.LOG, '', s);
            });
            yield this.emit(__1.EmitType.SUCCESS, 'installed', '');
        });
    }
    build(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emit(__1.EmitType.OPERATION, 'building', `Building with NPM ${opts.BUILD_CMD} in ${opts.BUILD_SOURCE_DIR}`);
            const spawn_options = {
                cwd: opts.BUILD_SOURCE_DIR,
                env: this.buildEnv(opts)
            };
            yield utils_1.shellSpawn('npm', ['run', '--no-color', opts.BUILD_CMD], spawn_options, (s) => {
                this.emit(__1.EmitType.LOG, '', s);
            });
            yield this.emit(__1.EmitType.SUCCESS, 'build', '');
        });
    }
    run(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.install(opts);
            yield this.build(opts);
        });
    }
}
exports.BuildNPMRun = BuildNPMRun;
//# sourceMappingURL=build-npm.js.map