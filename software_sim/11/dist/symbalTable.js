"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var SymbolTable = /** @class */ (function () {
    function SymbolTable() {
        this.staticTable = {};
        this.fieldTable = {};
        this.argTable = {};
        this.varTable = {};
    }
    SymbolTable.prototype.startSubroutine = function () {
        this.argTable = {};
        this.varTable = {};
    };
    SymbolTable.prototype.define = function (name, type, kind) {
        switch (kind) {
            case constants_1.KIND.STATIC:
                this.staticTable[name] = {
                    type: type,
                    kind: kind,
                    index: this.varCount(constants_1.KIND.STATIC)
                };
                break;
            case constants_1.KIND.FIELD:
                this.fieldTable[name] = {
                    type: type,
                    kind: kind,
                    index: this.varCount(constants_1.KIND.FIELD)
                };
                break;
            case constants_1.KIND.ARGUMENT:
                this.argTable[name] = {
                    type: type,
                    kind: kind,
                    index: this.varCount(constants_1.KIND.ARGUMENT)
                };
                break;
            case constants_1.KIND.VAR:
                this.varTable[name] = {
                    type: type,
                    kind: kind,
                    index: this.varCount(constants_1.KIND.VAR)
                };
                break;
            default:
                throw new Error('invalid kind in define method');
        }
    };
    SymbolTable.prototype.varCount = function (kind) {
        var result = 0;
        switch (kind) {
            case constants_1.KIND.STATIC:
                result = Object.keys(this.staticTable).length;
                break;
            case constants_1.KIND.FIELD:
                result = Object.keys(this.fieldTable).length;
                break;
            case constants_1.KIND.ARGUMENT:
                result = Object.keys(this.argTable).length;
                break;
            case constants_1.KIND.VAR:
                result = Object.keys(this.varTable).length;
                break;
            default:
                throw new Error('invalid kind in varCount method');
        }
        return result;
    };
    SymbolTable.prototype.kindOf = function (name) {
        var result = '';
        if (name in this.argTable) {
            result = this.argTable[name].kind;
        }
        else if (name in this.varTable) {
            result = this.varTable[name].kind;
        }
        else if (name in this.staticTable) {
            result = this.staticTable[name].kind;
        }
        else if (name in this.fieldTable) {
            result = this.fieldTable[name].kind;
        }
        else {
            result = constants_1.KIND.NONE;
        }
        return result;
    };
    SymbolTable.prototype.typeOf = function (name) {
        var result = '';
        if (name in this.argTable) {
            result = this.argTable[name].type;
        }
        else if (name in this.varTable) {
            result = this.varTable[name].type;
        }
        else if (name in this.staticTable) {
            result = this.staticTable[name].type;
        }
        else if (name in this.fieldTable) {
            result = this.fieldTable[name].type;
        }
        else {
            throw new Error("invalid name for typeOf, name: " + name);
        }
        return result;
    };
    SymbolTable.prototype.indexOf = function (name) {
        var result = 0;
        if (name in this.argTable) {
            result = this.argTable[name].index;
        }
        else if (name in this.varTable) {
            result = this.varTable[name].index;
        }
        else if (name in this.staticTable) {
            result = this.staticTable[name].index;
        }
        else if (name in this.fieldTable) {
            result = this.fieldTable[name].index;
        }
        else {
            throw new Error("invalid name for indexOf, name: " + name);
        }
        return result;
    };
    return SymbolTable;
}());
exports.default = SymbolTable;
