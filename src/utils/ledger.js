import { LedgerSigner } from "@cosmjs/ledger-amino";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { comdex } from "../config/network";
import { makeHdPath } from "./string";

const interactiveTimeout = 120_000;

export async function createTransport() {
  const ledgerTransport = await TransportWebUSB.create(
    interactiveTimeout,
    interactiveTimeout
  );
  return ledgerTransport;
}

export const fetchAddress = async (accountNumber = "0", addressIndex = "0") => {
  let transport = await createTransport();
  transport.on("disconnect", () => {
    alert("ledger disconnected please login again");

    localStorage.removeItem("ac");
    localStorage.removeItem("loginType");
    window.location.reload();
  });

  const signer = new LedgerSigner(transport, {
    testModeAllowed: true,
    hdPaths: [makeHdPath(accountNumber, addressIndex)],
    prefix: comdex.prefix,
  });
  const [firstAccount] = await signer.getAccounts();

  return firstAccount.address;
};
