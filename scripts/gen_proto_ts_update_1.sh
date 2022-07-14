#this script can generate ts proto files for one module at a time
#provide input directory and third party directories with flag --proto_path
#provide the output directory where you want to generate .ts files with  flag --ts_proto_out
#before running this script make sure you have ts-proto in node_modules else do `npm install ts-proto` and also specify path according to where it is located with flag -- plugin
#this script can be run from any where in your system as every path is absolute
#after you run script identify imports that are using local directories(directories in output directory) and change those import paths to global directories in .ts files
#finally remove local directories in output directory

PROTOC_GEN_TS_PATH="../node_modules/.bin/protoc-gen-ts_proto"

COMMON_PATH="$HOME/go/src/github.com/comdex-official/comdex"

#example for generating ts files for market module
INPUT_DIR="$COMMON_PATH/proto/comdex/market/v1beta1"
OUT_DIR="$HOME/go/src/github.com/comdex-official/proto-codecs/codec/comdex/market/v1beta1"


COSMOS_PATH="$COMMON_PATH/vendor/github.com/cosmos/cosmos-sdk/proto"
COMDEX_PATH="$COMMON_PATH/proto"
THIRD_PARTY="$COMMON_PATH/vendor/github.com/cosmos/iavl/third_party"

for filename in $INPUT_DIR/*.proto; do

protoc \
       --plugin="$PROTOC_GEN_TS_PATH" \
       --ts_proto_out="$OUT_DIR" \
       --proto_path="$COMMON_PATH/vendor/github.com/gogo/protobuf" \
       --proto_path="$COMMON_PATH/vendor" \
       --proto_path="$INPUT_DIR" \
       --proto_path="$COSMOS_PATH" \
       --proto_path="$COMDEX_PATH" \
       --proto_path="$THIRD_PARTY" \
       --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=true" \
       "$filename" \
# shellcheck disable=SC1126
# shellcheck disable=SC1010
done
