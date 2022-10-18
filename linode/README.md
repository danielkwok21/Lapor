# What is this
This folder contains cors policies for linode buckets. It is just a glorified note taking directory atm. To implement cors or verify it, manually run the commands under [Quick snippets](#quick-snippets).

## How to install and configure s3cmd
https://www.linode.com/docs/products/storage/object-storage/guides/s3cmd#Configuring+S3cmd

## Quick snippets
```bash
# View buckets
s3cmd ls

# View bucket info, e.g. policy, cors, etc
s3cmd info <bucket-name>

# Change bucket cors
# https://www.linode.com/docs/guides/working-with-cors-linode-object-storage/
s3cmd setcors <path-to-cors-file> <bucket-name>
```