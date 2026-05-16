#!/bin/bash
set -e

APP_URL="${APP_URL:-http://localhost:5180}"
OUT_DIR="dist"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp *.html *.css "$OUT_DIR/"
cp *.svg "$OUT_DIR/" 2>/dev/null || true

# Replace placeholder with actual app URL
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|__APP_URL__|${APP_URL}|g" "$OUT_DIR"/*.html
else
  sed -i "s|__APP_URL__|${APP_URL}|g" "$OUT_DIR"/*.html
fi

echo "Marketing site built → $OUT_DIR/ (APP_URL=$APP_URL)"
