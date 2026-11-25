#!/bin/sh
set -eu

password_file=/run/secrets/academy.htpasswd

if ! test -f "$password_file"; then
    echo "VirtualShip Academy: password file is missing or is not a regular file" >&2
    exit 1
fi

if ! test -s "$password_file"; then
    echo "VirtualShip Academy: password file is empty" >&2
    exit 1
fi

if ! test -r "$password_file"; then
    echo "VirtualShip Academy: password file is not readable by the container user" >&2
    exit 1
fi

exec nginx -g "daemon off;"
