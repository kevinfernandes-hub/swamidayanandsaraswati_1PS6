/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'india-saffron': '#FF9933',
                'india-white': '#FFFFFF',
                'india-green': '#138808',
                'india-blue': '#000080',
            },
        },
    },
    plugins: [],
}
