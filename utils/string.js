import { sha256, stringToPath } from "@cosmjs/crypto";
import { comdex } from "@/config/network";

export const makeHdPath = (
    accountNumber = "0",
    addressIndex = "0",
    coinType = comdex.coinType
) => {
    return stringToPath(
        "m/44'/" + coinType + "'/" + accountNumber + "'/0/" + addressIndex
    );
};