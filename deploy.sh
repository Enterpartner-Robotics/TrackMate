#!/bin/bash

# =====================================
# CONFIGURATION
# =====================================
GIT_REPO_URL="https://github.com/Enterpartner-Robotics/TrackMate.git"
WEBHOOK_URL="https://discord.com/api/webhooks/your_webhook_id"
DEPLOY_DIR="/var/www/html"
LOG_FILE="$DEPLOY_DIR/deploy.log"
BRANCH="main"

# =====================================
# FUNCTIONS
# =====================================

log() {
    local message="$1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $message" | tee -a "$LOG_FILE"
}

send_discord() {
    local content="$1"
    curl -s -H "Content-Type: application/json" \
        -X POST \
        -d "{\"content\":\"$content\"}" \
        "$WEBHOOK_URL" > /dev/null
}

error_exit() {
    local message="$1"
    log "ERROR: $message"
    send_discord "❌ Deployment failed: $message"
    exit 1
}

# =====================================
# START DEPLOYMENT
# =====================================

START_TIME=$(date +%s)
log "================ Starting deployment ================="

cd "$DEPLOY_DIR" || error_exit "Failed to cd to $DEPLOY_DIR"

# Fetch latest commits
log "Fetching latest commits from remote..."
git fetch origin || error_exit "git fetch failed"

LOCAL_COMMIT=$(git rev-parse HEAD) || error_exit "Failed to get local commit"
REMOTE_COMMIT=$(git rev-parse origin/$BRANCH) || error_exit "Failed to get remote commit"

log "Local commit: $LOCAL_COMMIT"
log "Remote commit: $REMOTE_COMMIT"

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    # clickable GitHub link
    COMMIT_LINK="[$REMOTE_COMMIT]($GIT_REPO_URL/commit/$REMOTE_COMMIT)"
    log "New update detected! Starting deployment..."
    send_discord "🚀 New update detected! Starting deployment...\nRemote commit: $COMMIT_LINK"

    # Pull changes
    git pull origin $BRANCH || error_exit "git pull failed"

    # Restart Apache
    log "Restarting Apache..."
    systemctl restart apache2 || error_exit "Failed to restart Apache"

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    log "Deployment finished successfully in ${DURATION}s"
    send_discord "✅ Deployment finished successfully in ${DURATION}s\nRemote commit: $COMMIT_LINK"
else
    log "No updates detected. Deployment skipped."
fi