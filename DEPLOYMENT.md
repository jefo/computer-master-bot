# Deployment Instructions

This repository contains two separate bots that can be deployed independently:

1. **Computer Master Bot**
2. **Sales Bot**

## Prerequisites

- SSH access to the target server
- Bun runtime installed on the target server
- Your SSH key or password authentication configured

## Deployment Approaches

### 1. Monorepo Deployment

You can deploy the entire repository and then choose which bot to run on the server.

#### Environment Variables

The deployment script uses the following environment variables:

- `DEPLOY_USER` (required): Your SSH username on the target server
- `DEPLOY_HOST` (optional): The hostname or IP address of the target server (default: 37.46.19.110)
- `DEPLOY_PATH` (optional): The path on the server where the application will be deployed (default: /tmp/computer-master-sales-bot)
- `BOT_TYPE` (optional): Which bot to run after deployment (default: 'computer-master', options: 'computer-master' or 'sales')

### 2. Running the Deployment

Run the deployment script with the required environment variable:

```bash
DEPLOY_USER=your_username ./deploy.sh
```

Or with all environment variables:

```bash
DEPLOY_USER=your_username DEPLOY_HOST=37.46.19.110 DEPLOY_PATH=/path/to/deploy BOT_TYPE=sales ./deploy.sh
```

## What the Script Does

1. Creates the deployment directory on the remote server if it doesn't exist
2. Syncs all project files to the remote server (excluding node_modules and .git)
3. Runs `bun install` on the remote server to install dependencies
4. Starts the specified bot using the appropriate command in the background
5. Redirects output to `app.log` for monitoring

## Notes

- The script uses `rsync` with compression and archive settings for efficient file transfer
- The application is started with `nohup` so it continues running after the SSH session ends
- Make sure your server has Bun installed, otherwise the deployment will fail
- You can modify the deployment script to run both bots if needed