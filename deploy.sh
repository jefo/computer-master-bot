#!/bin/bash

# Deployment script for the computer master and sales bots
# Usage:
#   Set environment variables:
#     DEPLOY_HOST (default: 37.46.19.110)
#     DEPLOY_USER (your SSH username)
#     DEPLOY_SSH_KEY (optional: path to SSH private key)
#     DEPLOY_PATH (path on the server where to deploy)
#     BOT_TYPE (default: computer-master, options: computer-master or sales)
#   Then run: ./deploy.sh

set -e  # Exit immediately if a command exits with a non-zero status

# Default values
DEFAULT_HOST="37.46.19.110"
DEFAULT_PATH="~/demo"
DEPLOY_USER="root"
DEFAULT_BOT_TYPE="computer-master"

# Use environment variables or defaults
DEPLOY_HOST=${DEPLOY_HOST:-$DEFAULT_HOST}
DEPLOY_USER=${DEPLOY_USER:?"DEPLOY_USER environment variable is required"}
DEPLOY_PATH=${DEPLOY_PATH:-$DEFAULT_PATH}
BOT_TYPE=${BOT_TYPE:-$DEFAULT_BOT_TYPE}

echo "Deploying ${BOT_TYPE} bot to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

# Validate BOT_TYPE
if [[ "$BOT_TYPE" != "computer-master" && "$BOT_TYPE" != "sales" ]]; then
    echo "Error: BOT_TYPE must be either 'computer-master' or 'sales'"
    exit 1
fi

# Function to check if SSH key exists and is accessible
check_ssh_key() {
    local key_path="$1"
    if [ -n "$key_path" ] && [ -f "$key_path" ] && [ -r "$key_path" ]; then
        return 0
    else
        return 1
    fi
}

# Function to execute SSH command with SSH key
ssh_cmd() {
    local cmd="$1"
    if check_ssh_key "$DEPLOY_SSH_KEY"; then
        ssh -i "$DEPLOY_SSH_KEY" -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "$cmd"
    else
        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "$cmd"
    fi
}

# Function to execute rsync with SSH key
rsync_cmd() {
    local src="$1"
    local dest="$2"
    if check_ssh_key "$DEPLOY_SSH_KEY"; then
        rsync -avz -e "ssh -i $DEPLOY_SSH_KEY -o StrictHostKeyChecking=no" --exclude node_modules --exclude .git --exclude dist "$src" "$dest"
    else
        rsync -avz --exclude node_modules --exclude .git --exclude dist "$src" "$dest"
    fi
}

# Check if SSH key is specified but not accessible
if [ -n "$DEPLOY_SSH_KEY" ] && ! check_ssh_key "$DEPLOY_SSH_KEY"; then
    echo "Warning: DEPLOY_SSH_KEY is set but the key file is not accessible: $DEPLOY_SSH_KEY"
    echo "Falling back to default SSH authentication method."
fi

# Function to check if remote directory exists
check_remote_dir() {
    ssh_cmd "test -d ${DEPLOY_PATH}"
    return $?
}

# Create remote directory if it doesn't exist
if ! check_remote_dir; then
    echo "Creating remote directory: ${DEPLOY_PATH}"
    ssh_cmd "mkdir -p ${DEPLOY_PATH}"
fi

echo "Syncing files to remote server..."
# Use rsync to sync files to the server
rsync_cmd "./" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "Installing dependencies on remote server..."
ssh_cmd "cd ${DEPLOY_PATH} && bun install"

if [ "$BOT_TYPE" = "computer-master" ]; then
    echo "Starting the Computer Master bot on remote server..."
    # We'll use nohup to keep the process running after disconnecting
    ssh_cmd "cd ${DEPLOY_PATH}/computer-master && nohup bun run index.ts > ../app.log 2>&1 &"
    PROCESS_NAME="index.ts"
else
    echo "Starting the Sales bot on remote server..."
    # We'll use nohup to keep the process running after disconnecting
    ssh_cmd "cd ${DEPLOY_PATH}/sales-bot && nohup bun run sales-bot-demo.ts > ../app.log 2>&1 &"
    PROCESS_NAME="sales-bot-demo.ts"
fi

echo "Deployment completed!"
echo "Check status with: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'tail -n 20 ${DEPLOY_PATH}/app.log'"
echo "To stop the process: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'pkill -f ${PROCESS_NAME}'"
