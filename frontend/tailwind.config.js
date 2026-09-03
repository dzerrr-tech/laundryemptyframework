/** @type {import('tailwindcss').Config} */
export default {
  // "content" memberitahu Tailwind file mana saja yang harus dipindai
  // untuk mencari class yang dipakai, supaya CSS akhirnya cuma berisi
  // class yang benar-benar dipakai (bukan semua class Tailwind yang ada).
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: []
};
