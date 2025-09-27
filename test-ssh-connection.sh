#!/bin/bash

# SSH Connection Test Script
# Tests SSH connectivity to the deployment server using your SSH key

set -e

# Default values matching the deployment script
DEFAULT_HOST="37.46.19.110"
DEFAULT_USER="root"
DEFAULT_SSH_KEY="/home/j4jk3wka/.ssh/id_ed25519"

# Use environment variables or defaults
DEPLOY_HOST=${DEPLOY_HOST:-$DEFAULT_HOST}
DEPLOY_USER=${DEPLOY_USER:-$DEFAULT_USER}
DEPLOY_SSH_KEY=${DEPLOY_SSH_KEY:-$DEFAULT_SSH_KEY}

echo "=== SSH Connection Test ==="
echo "Server: $DEPLOY_USER@$DEPLOY_HOST"
echo "SSH Key: $DEPLOY_SSH_KEY"
echo ""

# Check if SSH key exists and is accessible
check_ssh_key() {
    local key_path="$1"
    if [ -n "$key_path" ] && [ -f "$key_path" ] && [ -r "$key_path" ]; then
        echo "✓ SSH key is accessible: $key_path"
        return 0
    else
        echo "✗ SSH key is not accessible: $key_path"
        echo "  Please check if the file exists and has read permissions"
        return 1
    fi
}

# Test basic SSH connectivity
test_ssh_connection() {
    echo ""
    echo "Testing SSH connection..."

    if check_ssh_key "$DEPLOY_SSH_KEY"; then
        echo "Attempting to connect with SSH key..."

        # Test connection with timeout
        if timeout 10s ssh -i "$DEPLOY_SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes ${DEPLOY_USER}@${DEPLOY_HOST} "echo '✓ SSH connection successful!'"; then
            echo ""
            echo "✅ SSH connection test PASSED"
            return 0
        else
            echo ""
            echo "❌ SSH connection test FAILED"
            echo "   Possible issues:"
            echo "   - SSH key not authorized on server"
            echo "   - Server not accessible"
            echo "   - Network connectivity issues"
            echo "   - Wrong username or host"
            return 1
        fi
    else
        echo "Cannot test connection without valid SSH key"
        return 1
    fi
}

# Test remote directory access (if connection works)
test_remote_access() {
    echo ""
    echo "Testing remote directory access..."

    # Check if deployment directory exists
    if ssh -i "$DEPLOY_SSH_KEY" -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "test -d ~/demo && echo '✓ Remote directory exists' || echo '✗ Remote directory does not exist'"; then
        echo "✓ Remote directory access successful"
    else
        echo "✗ Remote directory access failed"
    fi

    # Check Bun installation
    echo ""
    echo "Checking Bun installation on remote server..."
    ssh -i "$DEPLOY_SSH_KEY" -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} "which bun && echo '✓ Bun is installed' || echo '✗ Bun is not installed'"
}

# Main execution
main() {
    echo "Starting SSH connection tests..."
    echo ""

    if test_ssh_connection; then
        echo ""
        echo "=== Additional Remote Tests ==="
        test_remote_access

        echo ""
        echo "=== Deployment Ready ==="
        echo "Your SSH configuration is ready for deployment!"
        echo "You can now run: DEPLOY_USER=$DEPLOY_USER DEPLOY_SSH_KEY=$DEPLOY_SSH_KEY ./deploy.sh"
    else
        echo ""
        echo "=== Troubleshooting Steps ==="
        echo "1. Verify SSH key is copied to server:"
        echo "   ssh-copy-id -i $DEPLOY_SSH_KEY $DEPLOY_USER@$DEPLOY_HOST"
        echo ""
        echo "2. Test manual connection:"
        echo "   ssh -i $DEPLOY_SSH_KEY $DEPLOY_USER@$DEPLOY_HOST"
        echo ""
        echo "3. Check key permissions:"
        echo "   chmod 600 $DEPLOY_SSH_KEY"
        echo ""
        echo "4. Verify server accessibility:"
        echo "   ping $DEPLOY_HOST"
    fi
}

# Run the main function
main

echo ""
echo "=== Test Complete ==="
