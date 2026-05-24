export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#111827',
          gray: '#1f2937',
          orange: '#f97316',
          light: '#f8fafc'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
