import { type Config, optimize } from "svgo";

const config: Config ={
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

addEventListener("message", (e) => {
    const svgText = e.data as string;
    const output = optimize(svgText, config);
    
    postMessage(output.data);
})
