import { LedgerSigner } from '@cosmjs/ledger-amino';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { makeHdPath } from './string';
import { envConfigResult } from '@/config/envConfig';

const interactiveTimeout = 120_000;

export async function createTransport() {
  const ledgerTransport = await TransportWebUSB.create(
    interactiveTimeout,
    interactiveTimeout
  );
  return ledgerTransport;
}

export const fetchAddress = async (
  accountNumber: string = '0',
  addressIndex: string = '0'
) => {
  let transport = await createTransport();
  const comdex = await envConfigResult();
  transport.on('disconnect', () => {
    alert('ledger disconnected please login again');

    localStorage.removeItem('ac');
    localStorage.removeItem('loginType');
    window.location.reload();
  });

  const signer = new LedgerSigner(transport, {
    testModeAllowed: true,
    hdPaths: [makeHdPath(accountNumber, addressIndex)],
    prefix: comdex?.envConfig?.prefix,
  });
  const [firstAccount] = await signer.getAccounts();

  return firstAccount.address;
};
