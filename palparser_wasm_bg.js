let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {Buffer} data
* @param {Map<any, any> | undefined} [types]
* @param {Function | undefined} [progress]
* @returns {any}
*/
export function palFromRaw(data, types, progress) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(data, Buffer);
        wasm.palFromRaw(retptr, data.__wbg_ptr, isLikeNone(types) ? 0 : addHeapObject(types), isLikeNone(progress) ? 0 : addHeapObject(progress));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
* @param {Uint8Array} buffer
* @param {Map<any, any> | undefined} [types]
* @param {Function | undefined} [progress]
* @returns {any}
*/
export function deserialize(buffer, types, progress) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.deserialize(retptr, addBorrowedObject(buffer), isLikeNone(types) ? 0 : addHeapObject(types), isLikeNone(progress) ? 0 : addHeapObject(progress));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        heap[stack_pointer++] = undefined;
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_81(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h34ac7534ab213db2(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export class Buffer {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_buffer_free(ptr);
    }
    /**
    * @param {number} byte_length
    * @param {Function} f
    */
    constructor(byte_length, f) {
        try {
            const ret = wasm.buffer_new(byte_length, addBorrowedObject(f));
            this.__wbg_ptr = ret >>> 0;
            return this;
        } finally {
            heap[stack_pointer++] = undefined;
        }
    }
}
/**
*/
export class CustomFormatData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CustomFormatData.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof CustomFormatData)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_customformatdata_free(ptr);
    }
    /**
    * @returns {string}
    */
    get id() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_customformatdata_id(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set id(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_customformatdata_id(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {number}
    */
    get value() {
        const ret = wasm.__wbg_get_customformatdata_value(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set value(arg0) {
        wasm.__wbg_set_customformatdata_value(this.__wbg_ptr, arg0);
    }
}
/**
*/
export class Header {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Header.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_header_free(ptr);
    }
    /**
    * @returns {number}
    */
    get magic() {
        const ret = wasm.__wbg_get_header_magic(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set magic(arg0) {
        wasm.__wbg_set_header_magic(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get save_game_version() {
        const ret = wasm.__wbg_get_header_save_game_version(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set save_game_version(arg0) {
        wasm.__wbg_set_header_save_game_version(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {bigint}
    */
    get package_version() {
        const ret = wasm.__wbg_get_header_package_version(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
    * @param {bigint} arg0
    */
    set package_version(arg0) {
        wasm.__wbg_set_header_package_version(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get engine_version_major() {
        const ret = wasm.__wbg_get_header_engine_version_major(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set engine_version_major(arg0) {
        wasm.__wbg_set_header_engine_version_major(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get engine_version_minor() {
        const ret = wasm.__wbg_get_header_engine_version_minor(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set engine_version_minor(arg0) {
        wasm.__wbg_set_header_engine_version_minor(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get engine_version_patch() {
        const ret = wasm.__wbg_get_header_engine_version_patch(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set engine_version_patch(arg0) {
        wasm.__wbg_set_header_engine_version_patch(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get engine_version_build() {
        const ret = wasm.__wbg_get_header_engine_version_build(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set engine_version_build(arg0) {
        wasm.__wbg_set_header_engine_version_build(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {string}
    */
    get engine_version() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_header_engine_version(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set engine_version(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_header_engine_version(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {number}
    */
    get custom_format_version() {
        const ret = wasm.__wbg_get_header_custom_format_version(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set custom_format_version(arg0) {
        wasm.__wbg_set_header_custom_format_version(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {(CustomFormatData)[]}
    */
    get custom_format() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_header_custom_format(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {(CustomFormatData)[]} arg0
    */
    set custom_format(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_header_custom_format(this.__wbg_ptr, ptr0, len0);
    }
}
/**
* Root struct inside a save file which holds both the Unreal Engine class name and list of properties
*/
export class Root {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Root.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_root_free(ptr);
    }
    /**
    * @returns {string}
    */
    get SaveGameType() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_customformatdata_id(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set SaveGameType(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_customformatdata_id(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {Map<any, any>}
    */
    get worldSaveData() {
        const ret = wasm.__wbg_get_root_worldSaveData(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {Map<any, any>} arg0
    */
    set worldSaveData(arg0) {
        wasm.__wbg_set_root_worldSaveData(this.__wbg_ptr, addHeapObject(arg0));
    }
}
/**
*/
export class Save {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_save_free(ptr);
    }
    /**
    * @returns {Header}
    */
    get header() {
        const ret = wasm.__wbg_get_save_header(this.__wbg_ptr);
        return Header.__wrap(ret);
    }
    /**
    * @param {Header} arg0
    */
    set header(arg0) {
        _assertClass(arg0, Header);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_save_header(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Root}
    */
    get root() {
        const ret = wasm.__wbg_get_save_root(this.__wbg_ptr);
        return Root.__wrap(ret);
    }
    /**
    * @param {Root} arg0
    */
    set root(arg0) {
        _assertClass(arg0, Root);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_save_root(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Array<any>}
    */
    get extra() {
        const ret = wasm.__wbg_get_save_extra(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * @param {Array<any>} arg0
    */
    set extra(arg0) {
        wasm.__wbg_set_save_extra(this.__wbg_ptr, addHeapObject(arg0));
    }
}

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_customformatdata_unwrap(arg0) {
    const ret = CustomFormatData.__unwrap(takeObject(arg0));
    return ret;
};

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_log_71c4aa666c112e27(arg0, arg1) {
    console.log(getStringFromWasm0(arg0, arg1));
};

export function __wbg_error_43938f09c9cb8cba(arg0, arg1) {
    console.error(getStringFromWasm0(arg0, arg1));
};

export function __wbg_customformatdata_new(arg0) {
    const ret = CustomFormatData.__wrap(arg0);
    return addHeapObject(ret);
};

export function __wbg_new_abda76e883ba8a5f() {
    const ret = new Error();
    return addHeapObject(ret);
};

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
    } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
};

export function __wbg_new_34c624469fb1d4fd() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_new_ad4df4628315a892() {
    const ret = new Map();
    return addHeapObject(ret);
};

export function __wbg_newwithlength_6f9d90ee462acc16(arg0) {
    const ret = new Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_set_379b27f1d5f1bf9c(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

export function __wbg_push_906164999551d793(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_call_f6a2bc58c19c53c6() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_forEach_5d4bb1e230176e0e(arg0, arg1, arg2) {
    try {
        var state0 = {a: arg1, b: arg2};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_81(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        getObject(arg0).forEach(cb0);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbg_set_83e83bc2428e50ab(arg0, arg1, arg2) {
    const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbg_fromEntries_dd0490602503ea2e() { return handleError(function (arg0) {
    const ret = Object.fromEntries(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_concat_b8781bec979daac0(arg0, arg1) {
    const ret = getObject(arg0).concat(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_buffer_5d1b598a01b41a42(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_d695c7957788f922(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_new_ace717933ad7117f(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_74906aa30864df5a(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_f0764416ba5bb237(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

