#!/bin/sh
set -e

echo "Waiting for PostgreSQL database at $POSTGRES_HOST:$POSTGRES_PORT..."
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 1
done
echo "PostgreSQL database started!"

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Making migrations..."
  python manage.py makemigrations accounts investigations entities relationships documents alerts audit --noinput

  echo "Running migrations..."
  python manage.py migrate --noinput
fi

echo "Starting application..."
exec "$@"
