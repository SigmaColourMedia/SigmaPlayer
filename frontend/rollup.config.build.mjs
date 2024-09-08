import typescript from '@rollup/plugin-typescript';
import typescriptEngine from 'typescript';
import terser from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-import-css";
import replace from "@rollup/plugin-replace";
import pluginManifest from 'rollup-plugin-output-manifest';
const { default: outputManifest } = pluginManifest
const config = {
    input: {
        "home": "./src/home/main.ts",
        "watch": "./src/watch/main.ts"
    },
    output: {
        format: "es",
        dir: "../static",
        entryFileNames: "[name]-[hash].js",

    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            exclude: '**/*.test.*',
            typescript: typescriptEngine,
            declaration: false,
        }),
        css(),
        nodeResolve(),
        terser(),
        filesize(),
        outputManifest({fileName: "../build/manifest.json"}),
        replace({
            'process.env.FILE_STORAGE_URL': JSON.stringify(process.env.FILE_STORAGE_URL),
            'process.env.WHEP_URL': JSON.stringify(process.env.WHEP_URL),
            'process.env.NOTIFICATION_BUS_URL': JSON.stringify(process.env.NOTIFICATION_BUS_URL),
            __buildDate__: () => JSON.stringify(new Date()),
            __buildVersion: 15,
            preventAssignment: true
        })
    ],
    watch: {
        clearScreen: false
    }
};


export default config;
