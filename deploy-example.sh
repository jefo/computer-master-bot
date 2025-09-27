#!/bin/bash

# Example usage of the deployment script with SSH key authentication
# This file demonstrates how to use the deploy.sh script with SSH keys

echo "=== Deployment Script Examples ==="
echo ""

echo "1. Using Default SSH Key (from ~/.ssh/)"
echo "---------------------------------------"
echo "DEPLOY_USER=root ./deploy.sh"
echo ""

echo "2. Using Specific SSH Key (Your Setup)"
echo "-------------------------------------"
echo "DEPLOY_USER=root DEPLOY_SSH_KEY=/home/j4jk3wka/.ssh/id_ed25519 ./deploy.sh"
echo ""

echo "3. Custom Host and Path with SSH Key"
echo "------------------------------------"
echo "DEPLOY_USER=root DEPLOY_HOST=192.168.1.100 DEPLOY_PATH=/opt/myapp DEPLOY_SSH_KEY=/home/j4jk3wka/.ssh/id_ed25519 ./deploy.sh"
echo ""

echo "4. Using Environment File (More Secure)"
echo "---------------------------------------"
echo "# Create a .env.deploy file (add to .gitignore):"
echo "cat > .env.deploy << EOF"
echo "DEPLOY_USER=root"
echo "DEPLOY_HOST=37.46.19.110"
echo "DEPLOY_PATH=~/demo"
echo "DEPLOY_SSH_KEY=/home/j4jk3wka/.ssh/id_ed25519"
echo "EOF"
echo ""
echo "# Then source and run:"
echo "source .env.deploy && ./deploy.sh"
echo ""

echo "5. One-liner with Environment Variables"
echo "--------------------------------------"
echo "DEPLOY_USER=root DEPLOY_SSH_KEY=/home/j4jk3wka/.ssh/id_ed25519 DEPLOY_HOST=example.com DEPLOY_PATH=/home/myapp ./deploy.sh"
echo ""

echo "=== SSH Key Setup Instructions ==="
echo ""

echo "1. Copy your public key to the server:"
echo "ssh-copy-id -i /home/j4jk3wka/.ssh/id_ed25519 root@37.46.19.110"
echo ""

echo "2. Test SSH connection:"
echo "ssh -i /home/j4jk3wka/.ssh/id_ed25519 root@37.46.19.110"
echo ""

echo "3. Set proper key permissions:"
echo "chmod 600 /home/j4jk3wka/.ssh/id_ed25519"
echo ""

echo "=== Security Best Practices ==="
echo ""

echo "• Use SSH keys instead of passwords for better security"
echo "• Set proper file permissions on private keys (chmod 600)"
echo "• Store key paths in environment files (add to .gitignore)"
echo "• Never commit private keys to version control"
echo "• Consider using an SSH agent for key management"
echo ""

echo "=== Troubleshooting ==="
echo ""

echo "If you get 'Permission denied (publickey)':"
echo "  • Verify the key path is correct"
echo "  • Check key permissions: chmod 600 /home/j4jk3wka/.ssh/id_ed25519"
echo "  • Ensure public key is on the server: ssh-copy-id -i /home/j4jk3wka/.ssh/id_ed25519 root@37.46.19.110"
echo "  • Test manually: ssh -i /home/j4jk3wka/.ssh/id_ed25519 root@37.46.19.110"
echo ""

echo "If the key file is not accessible:"
echo "  • Check if the file exists: ls -la /home/j4jk3wka/.ssh/id_ed25519"
echo "  • Verify read permissions"
echo "  • Ensure the path is absolute (not relative)"
echo ""

echo "For more details, see DEPLOYMENT.md"
