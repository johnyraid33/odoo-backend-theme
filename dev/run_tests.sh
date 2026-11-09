#!/bin/sh
# Run Odoo tests (Python, tours, JS) against the Odoo 19 stand's database with
# the Chromium-enabled image:  dev/run_tests.sh DB TEST_TAGS [extra odoo args]
# Stand:        ODOO_VERSION=19.0 ODOO_PORT=8190 docker compose -p rex-backend-theme-dev19 up -d
# Build image:  docker build --build-arg ODOO_VERSION=19.0 -f dev/Dockerfile.test -t rex-odoo-test:19.0 dev
set -e
cd "$(dirname "$0")"
DB=$1; TAGS=$2; shift 2
PROJECT=rex-backend-theme-dev19
docker compose -p $PROJECT stop odoo >/dev/null 2>&1 || true
docker run --rm --shm-size=1g --network ${PROJECT}_default \
    -v "$(cd .. && pwd)":/mnt/extra-addons:ro -v ${PROJECT}_filestore:/var/lib/odoo \
    rex-odoo-test:19.0 odoo -d "$DB" --db_host=db --db_user=odoo --db_password=odoo \
    --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons \
    --test-tags "$TAGS" --stop-after-init --http-port=8169 "$@" || true
ODOO_VERSION=19.0 ODOO_PORT=8190 docker compose -p $PROJECT start odoo >/dev/null 2>&1
