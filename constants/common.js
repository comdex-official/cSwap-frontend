import { envConfig } from '../config/envConfig';

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_FEE = 20000;
export const DOLLAR_DECIMALS = 2;
export const MAX_SLIPPAGE_TOLERANCE = 3;
export const PRICE_DECIMALS = 4;

let app = process.env.NEXT_PUBLIC_APP_APP;

export const APP_ID = Number(envConfig?.[app]?.appId);
export const MASTER_POOL_ID = Number(envConfig?.[app]?.masterPoolId);
export const NETWORK_TAG = envConfig?.[app]?.networkTag;
export const HOSTED_ON_TEXT = process.env.REACT_APP_HOSTED_ON_TEXT;
export const TRANSIT_URL = 'https://transit.comdex.one';
export const FIAT_URL =
  `https://app.kado.money?apiKey=${process.env.REACT_APP_FIAT_API_KEY}&onPayCurrency=USD&onRevCurrency=CMDX&offPayCurrency=CMDX&offRevCurrency=USD&onPayAmount=200&offPayAmount=50&network=COMDEX&cryptoList=USDT,USDC,CMDX&fiatList=USD,CAD,EUR&product=BUY&productList=BUY,SWAP`;

//Harbor
export const HARBOR_ASSET_ID = 9;
export const PRODUCT_ID = Number(envConfig?.['harbor']?.appId);
