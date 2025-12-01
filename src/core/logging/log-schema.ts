export type LogType = 'http' | 'business' | 'error';

export type BusinessOutcome = 'SUCCESS' | 'FAILED' | 'IDEMPOTENT_REPLAY';

export interface BusinessLogContext {
  logType: LogType;
  domain: string;
  entity?: string;
  entityId?: number | string;
  operation: string;
  outcome?: BusinessOutcome;
  correlationId?: string;
  amount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  idempotencyKey?: string;
  errorCode?: string;
  errorMessage?: string;
}
