module.exports = ({
    PORT: process.env.PORT || '3000',
    GITHUB_BASE_URL: 'https://api.github.com/repos',
    SERVICE_NAME: 'github-tree-builder',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    KEEP_ALIVE_TIMEOUT: 50000,
    NEW_CONNECTIONS_TIMEOUT: 7500,
    SHUTDOWN_TIMEOUT: 60000
});
