export class AppError extends Error {
  constructor(
    public override message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown): void => {
  if (error instanceof AppError) {
    console.error(`[${error.code}]: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`);
    console.error(error.stack);
  } else {
    console.error('Unknown error:', error);
  }
};

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
    handleError(event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    handleError(event.reason);
  });
}
