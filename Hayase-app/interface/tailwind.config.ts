import { fontFamily } from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

import type { Config } from 'tailwindcss'

function colorVar(varName: string, fallbackRgb: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgba(${fallbackRgb}, ${opacityValue})`
    }
    return `var(${varName})`
  }
}

const config: Config = {
  plugins: [
    plugin((api) => {
      api.addVariant('starting', '@starting-style')
      api.addVariant('select', ['&:hover', '&:focus-visible', '&:active'])
      api.addVariant('group-select', [':merge(.group):hover &', ':merge(.group):focus-visible &', ':merge(.group):active &'])
      api.addVariant('fullscreen', ['&:fullscreen', '&.custom-fullscreen'])
      api.addVariant('group-fullscreen', [':merge(.group):fullscreen &', ':merge(.group).custom-fullscreen &'])
      api.matchVariant(
        'group-fullscreen',
        (value, { modifier }) => [
          ':merge(.group):fullscreen &',
          `:merge(.group\\/${modifier}):fullscreen &`,
          ':merge(.group).custom-fullscreen &',
          `:merge(.group\\/${modifier}).custom-fullscreen &`
        ],
        { values: { DEFAULT: undefined } }
      )
      api.matchVariant(
        'group-select',
        (value, { modifier }) => [
          ':merge(.group):hover &',
          `:merge(.group\\/${modifier}):hover &`,
          ':merge(.group):focus-visible &',
          `:merge(.group\\/${modifier}):focus-visible &`,
          ':merge(.group):active &',
          `:merge(.group\\/${modifier}):active &`
        ],
        { values: { DEFAULT: undefined } }
      )
      api.addVariant('mobile', '@media (pointer: none), (pointer: coarse)')
      api.addVariant('desktop', '@media not ((pointer: none) or (pointer: coarse))')
      api.matchUtilities(
        {
          'view-transition': (value) => ({
            'view-transition-name': value
          })
        },
        {
          values: { DEFAULT: 'auto' },
          type: 'any'
        }
      )
      api.matchUtilities(
        {
          'backdrop-fade': (value) => ({
            '-webkit-backdrop-filter': `blur(${value})`,
            'backdrop-filter': `blur(${value})`,
            '-webkit-mask-image': 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            '-webkit-mask-composite': 'source-in',
            'mask-image': 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            'mask-composite': 'intersect'
          })
        },
        { values: { none: '0', sm: '4px', md: '8px', lg: '12px', xl: '24px', '2xl': '40px', '3xl': '64px' } }
      )
    })
  ],
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,svelte,ts}'],
  safelist: ['dark-mode'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
        xs: '480px'
      }
    },
    extend: {
      colors: {
        custom: {
          DEFAULT: colorVar('--custom', '255, 255, 255'),
          50: colorVar('--custom', '255, 255, 255'),
          100: colorVar('--custom', '255, 255, 255'),
          200: colorVar('--custom', '255, 255, 255'),
          300: colorVar('--custom', '255, 255, 255'),
          400: colorVar('--custom', '255, 255, 255'),
          500: colorVar('--custom', '255, 255, 255'),
          600: colorVar('--custom', '255, 255, 255'),
          700: colorVar('--custom', '255, 255, 255'),
          800: colorVar('--custom', '255, 255, 255'),
          900: colorVar('--custom', '255, 255, 255'),
          950: colorVar('--custom', '255, 255, 255')
        },
        theme: 'hsl(346.6deg 79.12% 51.18%)',
        border: colorVar('--border', '40, 40, 40'),
        input: colorVar('--input', '50, 50, 50'),
        ring: colorVar('--ring', '200, 200, 200'),
        background: colorVar('--background', '0, 0, 0'),
        foreground: colorVar('--foreground', '250, 250, 250'),
        primary: {
          DEFAULT: colorVar('--primary', '250, 250, 250'),
          foreground: colorVar('--primary-foreground', '15, 15, 15')
        },
        secondary: {
          DEFAULT: colorVar('--secondary', '40, 40, 45'),
          foreground: colorVar('--secondary-foreground', '250, 250, 250')
        },
        destructive: {
          DEFAULT: colorVar('--destructive', '220, 50, 50'),
          foreground: colorVar('--destructive-foreground', '250, 250, 250')
        },
        muted: {
          DEFAULT: colorVar('--muted', '15, 15, 15'),
          foreground: colorVar('--muted-foreground', '160, 160, 160')
        },
        accent: {
          DEFAULT: colorVar('--accent', '25, 25, 25'),
          foreground: colorVar('--accent-foreground', '250, 250, 250')
        },
        popover: {
          DEFAULT: colorVar('--popover', '15, 15, 15'),
          foreground: colorVar('--popover-foreground', '250, 250, 250')
        },
        card: {
          DEFAULT: colorVar('--card', '15, 15, 15'),
          foreground: colorVar('--card-foreground', '250, 250, 250')
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: [...fontFamily.sans]
      },
      screens: {
        '4xs': '280px',
        '3xs': '320px',
        '2xs': '360px',
        '2xl': '1400px',
        xs: '480px'
      }
    }
  }
}

export default config
