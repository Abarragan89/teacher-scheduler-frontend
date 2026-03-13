// eslint.config.mjs
import nextVitals from 'eslint-config-next/core-web-vitals';
import unusedImports from "eslint-plugin-unused-imports";

const config = [
    ...nextVitals,
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        rules: {
            "no-unused-vars": "off", // Turn off the base rule to avoid duplicate warnings
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
            ],
        },
    },
    // Add global ignores if needed (default ignores are already included in nextVitals)

]

export default config;