export default {
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    removeViewBox: false,
                    cleanupIds: false,
                    removeEmptyAttrs: false,
                    removeUnusedNS: false,
                },
            },
        },
    ],
};
