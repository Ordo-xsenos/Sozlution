type LogLevel = 'log' | 'error' | 'warn' | 'info'

class Logger {
  private get isDev() {
    return process.env.NODE_ENV === 'development'
  }

  private log(level: LogLevel, ...args: any[]) {
    if (this.isDev) {
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
    if (this.isDev) {
      this.log('log', '[DEBUG]', ...args)
    }
  }
}

export const logger = new Logger()
