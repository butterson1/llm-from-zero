#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Building English version..."
cd "$SCRIPT_DIR/en"
mdbook build

echo "🔨 Building Turkish version..."
cd "$SCRIPT_DIR/tr"
mdbook build

# Copy the landing page
cp "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/book/index.html"

echo "✅ Both builds complete → book/en/ and book/tr/"
