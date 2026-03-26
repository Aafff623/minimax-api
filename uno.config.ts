import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg cursor-pointer transition-all duration-200',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/90',
    'btn-secondary': 'btn bg-gray-200 text-gray-700 hover:bg-gray-300',
  },
})
