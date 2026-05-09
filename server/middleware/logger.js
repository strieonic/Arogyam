// server/middleware/logger.js
// HTTP request logging via Morgan — dev console + structured JSON for production
import morgan from 'morgan';

// Short format for development (colorized)
const devLogger = morgan('dev');

// Structured JSON format for production / log aggregators
morgan.token('body-size', (req) => {
  const len = req.headers['content-length'];
  return len ? `${(parseInt(len, 10) / 1024).toFixed(1)}kb` : '-';
});

const productionFormat = JSON.stringify({
  time: ':date[iso]',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time ms',
  bodySize: ':body-size',
  ip: ':remote-addr',
  userAgent: ':user-agent',
});

const prodLogger = morgan(productionFormat, {
  // Skip health checks to keep logs clean
  skip: (req) => req.url === '/health',
});

export const httpLogger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;
