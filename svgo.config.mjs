export default {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeViewBox: false,
                    cleanupIds: false,
                    removeUnknownsAndDefaults: false
                },
            },
        },
    ],
};
