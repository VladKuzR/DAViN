module.exports = function override(config, env) {
    config.devServer = {
        ...config.devServer,
        allowedHosts: ['davin.my-backend.site', 'localhost', '0.0.0.0'], // List the allowed hosts
    };
    return config;
};
