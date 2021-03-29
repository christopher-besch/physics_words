#!/bin/bash
set -euo pipefail
IFS=$' \n\t'
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

python3 create_page.py

if [ ! -d out ]; then
    mkdir out
fi

inliner out_int/index.html >out/index.html
