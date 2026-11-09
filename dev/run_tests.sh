#!/bin/sh
# Run Odoo tests (Python, tours, JS) against the stand's database with the
# Chromium-enabled image:  dev/run_tests.sh DB TEST_TAGS [extra odoo args]
# Build the image once:    docker build -f dev/Dockerfile.test -t rex-odoo-test:20.0 dev
set -e
cd "$(dirname "$0")"
DB=$1; TAGS=$2; shift 2
docker compose stop odoo >/dev/null 2>&1 || true
docker run --rm --shm-size=1g --network rex-backend-theme-dev_default \
    -v "$(cd .. && pwd)":/mnt/extra-addons:ro -v rex-backend-theme-dev_filestore:/var/lib/odoo \
    rex-odoo-test:20.0 odoo -d "$DB" --db_host=db --db_user=odoo --db_password=odoo \
    --addons-path=/mnt/extra-addons,/usr/lib/python3/dist-packages/odoo/addons \
    --test-tags "$TAGS" --stop-after-init --http-port=8169 "$@" || true
docker compose start odoo >/dev/null 2>&1
