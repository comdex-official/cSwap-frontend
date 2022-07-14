 #!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck >/dev/null && shellcheck "$0"

ROOT_PROTO_DIR="./proto/cosmos/cosmos-sdk"
COSMOS_PROTO_DIR="$ROOT_PROTO_DIR/proto"
THIRD_PARTY_PROTO_DIR="$ROOT_PROTO_DIR/third_party/proto"
OUT_DIR="./src/codec/"

mkdir -p "$OUT_DIR"

protoc \
  --plugin="$(yarn bin protoc-gen-ts_proto)" \
  --ts_proto_out="$OUT_DIR" \
  --proto_path="$COSMOS_PROTO_DIR" \
  --proto_path="$THIRD_PARTY_PROTO_DIR" \
  --ts_proto_opt="esModuleInterop=true,forceLong=long,useOptionals=true" \
  "$THIRD_PARTY_PROTO_DIR/comdex/vault/v1beta1/vault.proto" \
  "$THIRD_PARTY_PROTO_DIR/comdex/vault/v1beta1/msg.proto" \
  "$THIRD_PARTY_PROTO_DIR/comdex/vault/v1beta1/querier.proto" \
  "$THIRD_PARTY_PROTO_DIR/comdex/asset/v1beta1/asset.proto" \
  "$THIRD_PARTY_PROTO_DIR/comdex/asset/v1beta1/msg.proto" \
  "$THIRD_PARTY_PROTO_DIR/comdex/asset/v1beta1/params.proto" \
  "$THIRD_PARTY_PROTO_DIR/comdex/asset/v1beta1/querier.proto" \
  "$THIRD_PARTY_PROTO_DIR/tendermint/liquidity/v1beta1/liquidity.proto" \
  "$THIRD_PARTY_PROTO_DIR/tendermint/liquidity/v1beta1/tx.proto" \
  "$THIRD_PARTY_PROTO_DIR/tendermint/liquidity/v1beta1/query.proto"

# Remove unnecessary codec files
rm -rf \
  src/codec/cosmos_proto/ \
  src/codec/gogoproto/ \
  src/codec/google/api/ \
  src/codec/google/protobuf/descriptor.ts
