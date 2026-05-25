# CI/CD

Primary CI/CD for this repository is GitLab CI via `.gitlab-ci.yml`.

The pipeline is staged:

- `quality`: frontend ESLint.
- `test`: frontend Vitest and backend pytest with PostgreSQL service.
- `build`: frontend production build and Docker build smoke test.
- `security`: critical frontend audit and backend `pip-audit`.
- `publish`: build and push `frontend`, `backend`, and `nginx` images to GitLab Container Registry.
- `deploy`: staging and production deploy stubs. These jobs intentionally do not touch a server yet.
- `e2e`: manual or scheduled Playwright workflow.

GitHub Actions workflow files also exist as an alternative CI/CD setup, but `.gitlab-ci.yml` is the main GitLab entrypoint.

## GitLab Variables

GitLab provides these automatically when Container Registry is enabled:

- `CI_REGISTRY`
- `CI_REGISTRY_IMAGE`
- `CI_REGISTRY_USER`
- `CI_REGISTRY_PASSWORD`

Optional project/group variables:

- `NEXT_PUBLIC_API_BASE_URL`
- `BACKEND_INTERNAL_URL`
- `AI_API_KEY`
- `AI_API_URL`
- `AI_MODEL`

## GitLab Environments

- `staging`: manual deploy stub from the default branch.
- `production`: manual deploy stub from version tags like `v1.2.3`.

## Future VPS Secrets

When a VPS exists, add protected/masked GitLab variables:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_APP_DIR`

## Replacing The Deploy Stub

When a VPS exists, replace the echo commands in `deploy:staging` and `deploy:production` with SSH commands that run:

```bash
docker login registry.gitlab.com
docker compose pull
docker compose up -d --remove-orphans
docker compose ps
```
