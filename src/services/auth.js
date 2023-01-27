
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Params = exports.EthAccount = exports.protobufPackage = void 0;
var auth_1 = require("cosmjs-types/cosmos/auth/v1beta1/auth");
var minimal_1 = require("protobufjs/minimal");
exports.protobufPackage = "cosmos.auth.v1beta1";
var baseEthAccount = { code_hash: "" };
exports.EthAccount = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.Writer.create(); }
        if (message.base_account !== undefined) {
            auth_1.BaseAccount.encode(message.base_account, writer.uint32(10).fork()).ldelim();
        }
        if (message.code_hash !== "") {
            writer.uint32(18).string(message.code_hash);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof Uint8Array ? new minimal_1.Reader(input) : input;
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseEthAccount);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.base_account = auth_1.BaseAccount.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.code_hash = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseEthAccount);
        if (object.base_account !== undefined &&
            object.base_account !== null) {
            message.base_account = auth_1.BaseAccount.fromJSON(object.base_account);
        }
        else {
            message.base_account = undefined;
        }
        if (object.code_hash !== undefined && object.code_hash !== null) {
            message.code_hash = String(object.code_hash);
        }
        else {
            message.code_hash = "";
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.base_account !== undefined &&
            (obj.base_account = message.base_account
                ? auth_1.BaseAccount.toJSON(message.base_account)
                : undefined);
        message.code_hash !== undefined &&
            (obj.code_hash = message.code_hash);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseEthAccount);
        if (object.base_account !== undefined &&
            object.base_account !== null) {
            message.base_account = auth_1.BaseAccount.fromPartial(object.base_account);
        }
        else {
            message.base_account = undefined;
        }
        if (object.code_hash !== undefined && object.code_hash !== null) {
            message.code_hash = object.code_hash;
        }
        else {
            message.code_hash = "";
        }
        return message;
    },
};
var baseParams = {
    max_memo_characters: 0,
    tx_sig_limit: 0,
    tx_size_cost_per_byte: 0,
    sig_verify_cost_ed25519: 0,
    sig_verify_cost_secp256k1: 0,
};
exports.Params = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = minimal_1.Writer.create(); }
        if (message.max_memo_characters !== 0) {
            writer.uint32(8).uint64(message.max_memo_characters);
        }
        if (message.tx_sig_limit !== 0) {
            writer.uint32(16).uint64(message.tx_sig_limit);
        }
        if (message.tx_size_cost_per_byte !== 0) {
            writer.uint32(24).uint64(message.tx_size_cost_per_byte);
        }
        if (message.sig_verify_cost_ed25519 !== 0) {
            writer.uint32(32).uint64(message.sig_verify_cost_ed25519);
        }
        if (message.sig_verify_cost_secp256k1 !== 0) {
            writer.uint32(40).uint64(message.sig_verify_cost_secp256k1);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof Uint8Array ? new minimal_1.Reader(input) : input;
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = __assign({}, baseParams);
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.max_memo_characters = reader.uint64().toNumber();
                    break;
                case 2:
                    message.tx_sig_limit = reader.uint64().toNumber();
                    break;
                case 3:
                    message.tx_size_cost_per_byte = reader.uint64().toNumber();
                    break;
                case 4:
                    message.sig_verify_cost_ed25519 = reader.uint64().toNumber();
                    break;
                case 5:
                    message.sig_verify_cost_secp256k1 = reader.uint64().toNumber();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON: function (object) {
        var message = __assign({}, baseParams);
        if (object.max_memo_characters !== undefined &&
            object.max_memo_characters !== null) {
            message.max_memo_characters = Number(object.max_memo_characters);
        }
        else {
            message.max_memo_characters = 0;
        }
        if (object.tx_sig_limit !== undefined &&
            object.tx_sig_limit !== null) {
            message.tx_sig_limit = Number(object.tx_sig_limit);
        }
        else {
            message.tx_sig_limit = 0;
        }
        if (object.tx_size_cost_per_byte !== undefined &&
            object.tx_size_cost_per_byte !== null) {
            message.tx_size_cost_per_byte = Number(object.tx_size_cost_per_byte);
        }
        else {
            message.tx_size_cost_per_byte = 0;
        }
        if (object.sig_verify_cost_ed25519 !== undefined &&
            object.sig_verify_cost_ed25519 !== null) {
            message.sig_verify_cost_ed25519 = Number(object.sig_verify_cost_ed25519);
        }
        else {
            message.sig_verify_cost_ed25519 = 0;
        }
        if (object.sig_verify_cost_secp256k1 !== undefined &&
            object.sig_verify_cost_secp256k1 !== null) {
            message.sig_verify_cost_secp256k1 = Number(object.sig_verify_cost_secp256k1);
        }
        else {
            message.sig_verify_cost_secp256k1 = 0;
        }
        return message;
    },
    toJSON: function (message) {
        var obj = {};
        message.max_memo_characters !== undefined &&
            (obj.max_memo_characters = message.max_memo_characters);
        message.tx_sig_limit !== undefined &&
            (obj.tx_sig_limit = message.tx_sig_limit);
        message.tx_size_cost_per_byte !== undefined &&
            (obj.tx_size_cost_per_byte = message.tx_size_cost_per_byte);
        message.sig_verify_cost_ed25519 !== undefined &&
            (obj.sig_verify_cost_ed25519 = message.sig_verify_cost_ed25519);
        message.sig_verify_cost_secp256k1 !== undefined &&
            (obj.sig_verify_cost_secp256k1 =
                message.sig_verify_cost_secp256k1);
        return obj;
    },
    fromPartial: function (object) {
        var message = __assign({}, baseParams);
        if (object.max_memo_characters !== undefined &&
            object.max_memo_characters !== null) {
            message.max_memo_characters = object.max_memo_characters;
        }
        else {
            message.max_memo_characters = 0;
        }
        if (object.tx_sig_limit !== undefined &&
            object.tx_sig_limit !== null) {
            message.tx_sig_limit = object.tx_sig_limit;
        }
        else {
            message.tx_sig_limit = 0;
        }
        if (object.tx_size_cost_per_byte !== undefined &&
            object.tx_size_cost_per_byte !== null) {
            message.tx_size_cost_per_byte = object.tx_size_cost_per_byte;
        }
        else {
            message.tx_size_cost_per_byte = 0;
        }
        if (object.sig_verify_cost_ed25519 !== undefined &&
            object.sig_verify_cost_ed25519 !== null) {
            message.sig_verify_cost_ed25519 =
                object.sig_verify_cost_ed25519;
        }
        else {
            message.sig_verify_cost_ed25519 = 0;
        }
        if (object.sig_verify_cost_secp256k1 !== undefined &&
            object.sig_verify_cost_secp256k1 !== null) {
            message.sig_verify_cost_secp256k1 =
                object.sig_verify_cost_secp256k1;
        }
        else {
            message.sig_verify_cost_secp256k1 = 0;
        }
        return message;
    },
};
