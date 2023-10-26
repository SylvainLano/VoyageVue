/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,vue}',
  ],
  theme: {
    extend: {
      aspectRatio: {
        '8/19': '8 / 19',
      },      
      height: { 
        '756px': '756px', 
        '666px': '666px', 
      },   
    },
  },
  plugins: [],
}

