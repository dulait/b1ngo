#!/bin/bash
STAGED_CS_FILES=$(git diff --cached --name-only --diff-filter=d -- '*.cs')

if [ -z "$STAGED_CS_FILES" ]; then
  exit 0
fi

echo "$STAGED_CS_FILES" | xargs dotnet csharpier
echo "$STAGED_CS_FILES" | xargs git add
