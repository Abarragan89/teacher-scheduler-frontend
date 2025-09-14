// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",  // make sure this is here!
    "./src/**/*.{ts,tsx}",         // if you use src directory
  ],
  theme: { extend: {} },
  plugins: [],
}