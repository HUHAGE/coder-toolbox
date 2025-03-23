interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: string
}

interface QRCodeStatic {
  toDataURL(
    text: string,
    options: QRCodeOptions,
    callback: (error: Error | null, url: string) => void
  ): void
}

declare const QRCode: QRCodeStatic

declare module 'qrcode' {
  interface QRCodeOptions {
    version?: number
    errorCorrectionLevel?: string
    width?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  function toDataURL(
    text: string,
    options?: QRCodeOptions
  ): Promise<string>

  export default {
    toDataURL
  }
}

declare module 'qrcode.js' {
  class QRCode {
    constructor(
      element: HTMLElement,
      options: {
        text: string
        width?: number
        height?: number
        colorDark?: string
        colorLight?: string
        correctLevel?: number
      }
    )

    static L: number
    static M: number
    static Q: number
    static H: number
  }

  export default QRCode
}

declare module 'qrcode-vue3' {
  import { DefineComponent } from 'vue'

  interface QRCodeProps {
    value: string
    width?: number
    height?: number
    level?: string
    background?: string
    color?: {
      dark: string
      light: string
    }
    renderAs?: 'canvas' | 'svg'
  }

  const QRCodeVue3: DefineComponent<QRCodeProps>
  export default QRCodeVue3
} 