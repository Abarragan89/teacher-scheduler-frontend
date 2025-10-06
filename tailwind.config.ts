// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",  
    "./src/**/*.{ts,tsx}",    
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
    }
  },
  plugins: [],
}