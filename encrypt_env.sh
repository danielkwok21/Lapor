echo "Encrypting file..."
gpg --symmetric --cipher-algo AES256 --passphrase="$PASSPHRASE" ./.env

echo "...Done"