#!/bin/bash

# Extract project ID from Supabase URL
PROJECT_ID="ikelmblsikapgbxbpebz"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWxtYmxzaWthcGdieGJwZWJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzNDg4MiwiZXhwIjoyMDc4OTEwODgyfQ.0zTJzPRsBvYzwNQeP6ZgpwVkzvG11yz1tD6upX35zSQ"

# Create the config
mkdir -p .supabase
cat > .supabase/config.json << INNER_EOF
{
  "projectId": "$PROJECT_ID"
}
INNER_EOF

# Create auth file for CLI
mkdir -p ~/.supabase
cat > ~/.supabase/access-token << INNER_EOF
$SERVICE_KEY
INNER_EOF

echo "Config created at .supabase/config.json"
ls -la .supabase/
