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
exports.Run = void 0;
class Run {
    constructor(emitter, task) {
        this.emitter = emitter;
        this.task = task;
    }
    emit(type, state, details) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.emitter(this.task, type, state, details);
        });
    }
}
exports.Run = Run;
//# sourceMappingURL=run-base.js.map