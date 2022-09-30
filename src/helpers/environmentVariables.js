module.exports = ({
    PORT: '3000' || process.env.PORT,
    GITHUB_BASE_URL: 'https://api.github.com/repos',
    SERVICE_NAME: 'github-tree-builder',
    KEEP_ALIVE_TIMEOUT: 50000,
    NEW_CONNECTIONS_TIMEOUT: 7500,
    SHUTDOWN_TIMEOUT: 60000
});
