import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('should log in development mode', async () => {
    // Force development mode
    vi.stubEnv('NODE_ENV', 'development')
    
    logger.info('test info')
    expect(console.log).toHaveBeenCalledWith('[INFO]', 'test info')

    logger.error('test error')
    expect(console.error).toHaveBeenCalledWith('[ERROR]', 'test error')

    logger.warn('test warn')
    expect(console.warn).toHaveBeenCalledWith('[WARN]', 'test warn')

    logger.debug('test debug')
    expect(console.log).toHaveBeenCalledWith('[DEBUG]', 'test debug')
  })

  it('should only log errors in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    
    logger.info('test info')
    expect(console.log).not.toHaveBeenCalled()

    logger.error('test error')
    expect(console.error).toHaveBeenCalled()

    logger.debug('test debug')
    expect(console.log).not.toHaveBeenCalled()
  })
})
