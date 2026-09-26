/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2545',
          50: '#EAF0F8',
          100: '#CBDAEC',
          200: '#9BB8D9',
          300: '#6C95C6',
          400: '#3D73B3',
          500: '#1E5596',
          600: '#153E70',
          700: '#0B2545',
          800: '#081B33',
          900: '#050F1D'
        },
        sky: {
          DEFAULT: '#1B9AE0',
          50: '#EAF6FD',
          100: '#CDEAFA',
          200: '#9BD5F5',
          300: '#69C0F0',
          400: '#3BAAE8',
          500: '#1B9AE0',
          600: '#1478B3'
        },
        amber: {
          DEFAULT: '#F5A623',
          50: '#FEF6E9',
          100: '#FCE8C4',
          200: '#F9D28C',
          300: '#F7BC54',
          400: '#F5A623',
          500: '#D98A0F',
          600: '#B06F0C'
        }
      },
      fontFamily: {
        sans: ['"Cairo"', '"Tajawal"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      boxShadow: {
        card: '0 4px 16px rgba(11, 37, 69, 0.08)',
        cardHover: '0 8px 24px rgba(11, 37, 69, 0.14)'
      }
    }
  },
  plugins: []
};
