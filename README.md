# cSwap-frontend

Push changes to development branch. then pr from development -> staging (for testing). Then from staging -> main( this goes to testnet/mainet )

## Build Pipeline changes

Replace /src/config/ibc_assets.json file from https://github.com/comdex-official/comdex-assetlists. based on which server we are using.

Example: For devnet, replace the file with https://github.com/comdex-official/comdex-assetlists/blob/main/devnet/ibc_assets.json

Replace /src/config/envConfig.js file from https://github.com/comdex-official/comdex-assetlists. based on which server we are using.

Example: For devnet, replace the file with https://github.com/comdex-official/comdex-assetlists/blob/main/devnet/envConfig.js
    