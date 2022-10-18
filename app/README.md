## Setting up environment
1. Verify [./.env](./.env) is present. Else go through [../README.md](../README.md) to setup secret.

1. Install dependencies
```bash
npm install
```

## Getting started
```bash
docker-compose up -f development.yml up --force-recreate
```
Access from [http://localhost:4002](http://localhost:4002)

## Deployment
1. Git push to `master`
2. Github action would run. E.g. https://github.com/danielkwok21/Nutflix/actions/runs/3044167711