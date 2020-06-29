/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  theme: {
    extend: {
      backgroundColor: {
        br: {
          default: 'var(--brand-color, #ffffff)',
          l: 'var(--brand-color-light, #ffffff)',
          d: 'var(--brand-color-dark, #ffffff)',
        },
        p: 'var(--background-color, #ffffff)',
        s: 'var(--background-color-secondary, #ffffff)',
        t: {
          default: 'var(--text-color, #ffffff)',
          s: 'var(--text-color-secondary, #ffffff)',
        },
        scs: {
          default: 'var(--success-color)',
          c: 'var(--success-contrast-color)',
        },
        wrn: {
          default: 'var(--warning-color)',
          c: 'var(--warning-contrast-color)',
        },
        dan: {
          default: 'var(--danger-color)',
          c: 'var(--danger-contrast-color)',
        },
      },
      textColor: {
        br: {
          default: 'var(--brand-color, #ffffff)',
          l: 'var(--brand-color-light, #ffffff)',
          d: 'var(--brand-color-dark, #ffffff)',
        },
        p: 'var(--text-color, #ffffff)',
        s: 'var(--text-color-secondary, #ffffff)',
        bg: {
          default: 'var(--background-color, #ffffff)',
          s: 'var(--background-color-secondary, #ffffff)',
        },
        scs: {
          default: 'var(--success-contrast-color)',
          c: 'var(--success-color)',
        },
        wrn: {
          default: 'var(--warning-contrast-color)',
          c: 'var(--warning-color)',
        },
        dan: {
          default: 'var(--danger-contrast-color)',
          c: 'var(--danger-color)',
        },
      },
      borderColor: {
        br: {
          default: 'var(--brand-color, #ffffff)',
          l: 'var(--brand-color-light, #ffffff)',
          d: 'var(--brand-color-dark, #ffffff)',
        },
        bg: {
          default: 'var(--background-color, #ffffff)',
          s: 'var(--background-color-secondary, #ffffff)',
        },
        t: {
          default: 'var(--text-color, #ffffff)',
          s: 'var(--text-color-secondary, #ffffff)',
        },
        scs: {
          default: 'var(--success-color)',
          c: 'var(--success-contrast-color)',
        },
        wrn: {
          default: 'var(--warning-color)',
          c: 'var(--warning-contrast-color)',
        },
        dan: {
          default: 'var(--danger-color)',
          c: 'var(--danger-contrast-color)',
        },
      },
    },
    variants: {},
    plugins: [],
  },
}
