#!/bin/bash

# CONFIG
GIT_REPO_URL="https://github.com/Enterpartner-Robotics/TrackMate.git"
REPO_URL="https://github.com/Enterpartner-Robotics/TrackMate"
DEPLOY_DIR="/var/www/html"
LOG_FILE="$DEPLOY_DIR/deploy.log"
BRANCH="main"

ENV_FILE="$DEPLOY_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "ERROR: .env file not found in $DEPLOY_DIR" | tee -a "$LOG_FILE"
    exit 1
fi

[ -z "$WEBHOOK_URL" ] && { echo "ERROR: WEBHOOK_URL not set"; exit 1; }

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') | $1" | tee -a "$LOG_FILE"; }

send_discord_embed() {
    local title="$1"
    local description="$2"
    local color="$3"
    local fields="$4"

    curl -s -H "Content-Type: application/json" \
        -X POST \
        -d "{
            \"avatar_url\": \"https://avatars.githubusercontent.com/u/189319947?s=200&v=4\",
            \"embeds\": [{
                \"title\": \"$title\",
                \"description\": \"$description\",
                \"color\": $color,
                \"fields\": $fields
            }]
        }" "$WEBHOOK_URL" > /dev/null
}

error_exit() {
    local message="$1"
    log "ERROR: $message"
    send_discord_embed "❌ Deployment Failed" "$message" 15158332 "[]"
    exit 1
}

START_TIME=$(date +%s)
log "================ Starting deployment ================="

cd "$DEPLOY_DIR" || error_exit "Failed to cd to $DEPLOY_DIR"
git fetch origin || error_exit "git fetch failed"

LOCAL_COMMIT=$(git rev-parse HEAD) || error_exit "Failed to get local commit"
REMOTE_COMMIT=$(git rev-parse origin/$BRANCH) || error_exit "Failed to get remote commit"

LOCAL_COMMIT_SHORT="${LOCAL_COMMIT:0:7}"
REMOTE_COMMIT_SHORT="${REMOTE_COMMIT:0:7}"

log "Local commit: $LOCAL_COMMIT"
log "Remote commit: $REMOTE_COMMIT"

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    LOCAL_COMMIT_LINK="[\`$LOCAL_COMMIT_SHORT\`]($REPO_URL/commit/$LOCAL_COMMIT)"
    REMOTE_COMMIT_LINK="[\`$REMOTE_COMMIT_SHORT\`]($REPO_URL/commit/$REMOTE_COMMIT)"
    log "New update detected! Starting deployment..."

    send_discord_embed "🚀 Deployment Started" "Upgrading from $LOCAL_COMMIT_LINK to $REMOTE_COMMIT_LINK" 3447003 "[]"

    git pull --ff-only origin $BRANCH || error_exit "git pull failed"
    log "Restarting Apache..."
    systemctl restart apache2 || error_exit "Failed to restart Apache"

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    log "Deployment finished successfully in ${DURATION}s"

    FIELDS="[
        {\"name\": \"Changes\", \"value\": \"$LOCAL_COMMIT_LINK -> $REMOTE_COMMIT_LINK\", \"inline\": true}
    ]"

    send_discord_embed "✅ Deployment Finished" "Deployment finished successfully in \`${DURATION}s\`" 3066993 "$FIELDS"
else
    log "No updates detected. Deployment skipped."
fi