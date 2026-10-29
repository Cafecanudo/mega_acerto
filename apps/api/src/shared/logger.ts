import { pino, type Logger as PinoLogger } from 'pino';
import type { Config } from '../config/config.ts';

export type Logger = Pick<PinoLogger, 'debug' | 'info' | 'warn' | 'error'>;

export const criarLogger = (config: Config): PinoLogger => pino({ level: config.LOG_LEVEL });
