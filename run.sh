SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

(cd $SCRIPTPATH/backend && HOST_ADDRESS=127.0.0.1:9000 cargo run) & (cd $SCRIPTPATH/frontend && API_HOST=https://api.nynon.work npm run dev)