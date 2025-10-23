#!/bin/bash

FILES=$(find ./server -name "*.ts")

VIOLATIONS=$(grep -E -n "socket\.handshake\??\.address" $FILES 2>/dev/null || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ Error: Found usage of socket.handshake.address"
  echo ""
  echo "$VIOLATIONS"
  echo ""
  echo "Please use extractSocketIp(socket) instead of socket.handshake.address."
  echo ""
  echo "Example:"
  echo "  ❌ const ip = socket.handshake.address"
  echo "  ✅ const ip = extractSocketIp(socket)"
  exit 1
fi

exit 0
