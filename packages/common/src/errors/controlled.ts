/**
 * A controlled error will not be logged in a production environment, but will return a user friendly message to the client.
 *
 * To be used for "expected errors", such as invalid passwords or not enough funds.
 */
export class ControlledError extends Error {
  public httpCode: number;

  constructor(public message: string, public data?: Record<string, unknown>, httpCode?: number) {
    super();
    this.name = 'ControlledError';
    this.message = message;
    this.data = data;
    this.httpCode = httpCode || 400;
    Error.captureStackTrace(this, ControlledError);
  }
}

export interface ControlledResponse {
  type: 'Error' | 'ValidationError' | 'ControlledError';
  message: string;
  data: any;
}
