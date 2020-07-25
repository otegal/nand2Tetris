"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_SYMBOL_TABLE = {
    "SP": "0x0000",
    "LCL": "0x0001",
    "ARG": "0x0002",
    "THIS": "0x0003",
    "THAT": "0x0004",
    "R0": "0x0000",
    "R1": "0x0001",
    "R2": "0x0002",
    "R3": "0x0003",
    "R4": "0x0004",
    "R5": "0x0005",
    "R6": "0x0006",
    "R7": "0x0007",
    "R8": "0x0008",
    "R9": "0x0009",
    "R10": "0x000a",
    "R11": "0x000b",
    "R12": "0x000c",
    "R13": "0x000d",
    "R14": "0x000e",
    "R15": "0x000f",
    "SCREEN": "0x4000",
    "KBD": "0x6000",
};
var SymbolTable = /** @class */ (function () {
    function SymbolTable() {
        this.table = DEFAULT_SYMBOL_TABLE;
    }
    /**
     * テーブルにsymbol, addressのペアを追加する
     */
    SymbolTable.prototype.addEntry = function (symbol, address) {
        this.table[symbol] = address;
    };
    /**
     * シンボルテーブルに与えられたsymbolが含まれるかどうかを判定する
     */
    SymbolTable.prototype.contains = function (symbol) {
        return this.table[symbol] ? true : false;
    };
    /**
     * symbolに結び付けられたアドレスを返す
     */
    SymbolTable.prototype.getAddress = function (symbol) {
        return this.table[symbol];
    };
    return SymbolTable;
}());
exports.default = SymbolTable;
