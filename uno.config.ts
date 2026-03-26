import { defineConfig, presetIcons, presetUno, presetWebFonts } from 'unocss'

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
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Plus Jakarta Sans:400,500,600,700',
      },
    }),
  ],
  theme: {
    colors: {
      'primary': '#6366F1',
      'secondary': '#818CF8',
      'cta': '#10B981',
      'background': '#F5F3FF',
      'text-primary': '#1E1B4B',
      'text-secondary': '#4B5563',
      'text-muted': '#9CA3AF',
      'border-light': '#E5E7EB',
      'surface': '#FFFFFF',
      'surface-elevated': '#FAFAFA',
      'hover-overlay': 'rgba(99, 102, 241, 0.08)',
    },
    boxShadow: {
      'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      'button': '0 2px 4px rgba(99, 102, 241, 0.25)',
      'button-hover': '0 4px 8px rgba(99, 102, 241, 0.35)',
    },
    borderRadius: {
      'xl': '12px',
      '2xl': '16px',
      '3xl': '24px',
    },
  },
  shortcuts: {
    // Button shortcuts
    'btn': 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary text-white shadow-button hover:shadow-button-hover hover:bg-primary/90 transform hover:-translate-y-0.5 active:translate-y-0',
    'btn-cta': 'btn bg-cta text-white shadow-button hover:shadow-button-hover hover:bg-cta/90 transform hover:-translate-y-0.5 active:translate-y-0',
    'btn-secondary': 'btn bg-surface border-2 border-border-light text-text-primary hover:border-primary/50 hover:bg-hover-overlay',
    'btn-danger': 'btn bg-red-500 text-white hover:bg-red-600',
    'btn-ghost': 'btn bg-transparent text-text-primary hover:bg-hover-overlay',

    // Card shortcuts
    'card': 'bg-surface rounded-2xl shadow-card p-6 transition-all duration-200',
    'card-hover': 'card hover:shadow-card-hover hover:-translate-y-0.5',

    // Input shortcuts
    'input-base': 'w-full px-4 py-3 rounded-xl border-2 border-border-light bg-surface text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10',
    'input-error': 'border-red-500 focus:border-red-500 focus:ring-red-500/10',

    // Label shortcuts
    'label': 'block text-sm font-semibold text-text-primary mb-2',

    // Section shortcuts
    'section-title': 'text-xl font-bold text-text-primary',
    'section-subtitle': 'text-sm text-text-secondary mt-1',
  },
})
