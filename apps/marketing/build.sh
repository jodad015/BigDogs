#!/bin/bash
set -e

APP_URL="${APP_URL:-http://localhost:5180}"
OUT_DIR="dist"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/avatars"

cp *.html *.css "$OUT_DIR/"
cp *.svg "$OUT_DIR/" 2>/dev/null || true

# Copy avatar SVGs for the hero strip
AVATAR_SRC="../../apps/web/public/avatars"
for color in crimson sky gold mint plum; do
  cp "$AVATAR_SRC/bigdog-$color.svg" "$OUT_DIR/avatars/" 2>/dev/null || true
done

# Replace placeholder with actual app URL
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|__APP_URL__|${APP_URL}|g" "$OUT_DIR"/*.html
else
  sed -i "s|__APP_URL__|${APP_URL}|g" "$OUT_DIR"/*.html
fi

echo "Marketing site built → $OUT_DIR/ (APP_URL=$APP_URL)"
