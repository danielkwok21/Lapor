#!/bin/bash
if [[ -z "${PASSPHRASE}" ]]; then
    echo "Cannot find environment variable \$PASSPHRASE. Has it been set and exported?"
    echo "(To set) PASSPHRASE=xxx"
    echo "(To export) export PASSPHRASE"
else
    echo "Decrypting file..."
    gpg --quiet --batch --yes --decrypt --passphrase="$PASSPHRASE" \
    --output .env ./.env.gpg

    echo "Copying file to ./cloudFunction"
    cp .env ./cloudFunction

    echo "Copying file to ./app"
    cp .env ./app

    echo "...Done"
fi