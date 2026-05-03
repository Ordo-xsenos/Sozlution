type LogLevel = 'log' | 'error' | 'warn' | 'info'

const isDev = process.env.NODE_ENV === 'development'

class Logger {
  private log(level: LogLevel, ...args: any[]) {
    if (isDev) {
      console[level](...args)
    } else if (level === 'error') {
      // В продакшене логируем только ошибки
      console.error(...args)
      // TODO: Отправить в Sentry когда будет настроен
      // Sentry.captureException(args[0])
    }
  }

  info(...args: any[]) {
    this.log('log', '[INFO]', ...args)
  }

  error(...args: any[]) {
    this.log('error', '[ERROR]', ...args)
  }

  warn(...args: any[]) {
    this.log('warn', '[WARN]', ...args)
  }

  debug(...args: any[]) {
    if (isDev) {
      this.log('log', '[DEBUG]', ...args)
    }
  }
}

export const logger = new Logger()
