# cSwap-frontend

Push changes to development branch. then pr from development -> staging (for testing). Then from staging -> main( this goes to testnet/mainet )

## Build Pipeline changes

Replace /src/config/ibc_assets.json file from https://github.com/comdex-official/comdex-assetlists. based on which server we are using.

Example: For devnet, replace the file with https://github.com/comdex-official/comdex-assetlists/blob/main/devnet/ibc_assets.json

Update the environment variables in the pipeline from the https://github.com/comdex-official/enviroment-details for respective server.

Note: Take the REACT_APP_{Token}_IBC_DENOM variable values from  https://github.com/comdex-official/comdex-assetlists for respective server.

Example: REACT_APP_ATOM_IBC_DENOM value has to be updated from https://github.com/comdex-official/comdex-assetlists cosmos chain details.
    