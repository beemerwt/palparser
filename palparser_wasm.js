import * as wasm from "./palparser_wasm_bg.wasm";
import { __wbg_set_wasm } from "./palparser_wasm_bg.js";
__wbg_set_wasm(wasm);
export * from "./palparser_wasm_bg.js";
