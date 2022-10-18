# Lapor

## Getting started
Decrypt [./.env.gpg](./.env.gpg) to get [./env](./env) which contains all secrets + environment variables.

1. Set passphrase to decrypt [./.env.gpg](./.env.gpg) as environment variable
```bash
# Set value
> PASSPHRASE=xxxx

# Export so it's usable at the next step
> export PASSPHRASE
```

2. Run [./decrypt_env.sh](./decrypt_env.sh)
```bash
> ./decrypt_env.sh
``` 

Refer the rest of the flow at [./app/README.md](./app/README.md)

## Directories
| Path                                             | What is it                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [./app](./app)                     | Nextjs entrypoint |
| [./.env.gpg](./.env.gpg)| Encrypted secret to be used as environment variables


## Handy
1. How to encrypt
```bash
# Assuming .mysecret is the secret file.
# This will generate a .mysecret.gpg encrypted secret file
# Will prompt for a passphrase
> gpg --symmetric --cipher-algo AES256 ./.mysecret

```

2. How to decrypt
```bash
# Set provided passphrase as environment variable
> PASSPHRASE=xxxx

# Use passphrase to decrypt and re-generate original file
# Assuming .mysecret.gpg is the encrypted secret file
> gpg --quiet --batch --yes --decrypt --passphrase="$PASSPHRASE" --output ./.mysecret ./.mysecret.gpg
```

1. How to CRUD environment variables?
```bash
# First decrypt ./.env.gpg
> PASSPHRASE=xxxx
> gpg --quiet --batch --yes --decrypt --passphrase="$PASSPHRASE" --output ./.env ./.env.gpg

# Then edit the resulting .env
echo RANDOM=VARIABLE >> ./.env

# Then delete .env.gpg. We will be re-generating this
rm .env.gpg

# Then re-generate ./.env.gpg by encrypting ./.env
# IMPORTANT - use the same passphrase as previous when prompted
> gpg --symmetric --cipher-algo AES256 ./.env

# Replace all ./env instances used locally
> ./decrypt_env.sh
```

## Stack
- Nextjs
- Linode server for compute
- Linode object storage for storing content
- GCP Cloud Function for thumbnail generation service