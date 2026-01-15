/**
 * Error handler utility to convert database/technical errors to user-friendly messages
 * This prevents leaking internal database structure information to users
 */

interface DatabaseError {
  message?: string;
  code?: string;
  details?: string;
}

/**
 * Maps technical database errors to user-friendly Portuguese messages
 */
export const getUserFriendlyError = (error: DatabaseError | unknown): string => {
  if (!error || typeof error !== 'object') {
    return 'Ocorreu um erro ao processar sua solicitação.';
  }

  const err = error as DatabaseError;
  const message = err.message?.toLowerCase() || '';
  const code = err.code || '';

  // Foreign key constraint violations
  if (message.includes('violates foreign key') || code === '23503') {
    return 'Não é possível excluir. Este registro está sendo usado em outro local.';
  }

  // Unique constraint violations
  if (message.includes('duplicate key') || message.includes('unique constraint') || code === '23505') {
    return 'Já existe um registro com essas informações.';
  }

  // Not null constraint violations
  if (message.includes('not-null constraint') || code === '23502') {
    return 'Campos obrigatórios não foram preenchidos.';
  }

  // Check constraint violations
  if (message.includes('check constraint') || code === '23514') {
    return 'Os dados informados não são válidos.';
  }

  // RLS policy violations
  if (message.includes('row-level security') || message.includes('rls') || code === '42501') {
    return 'Você não tem permissão para realizar esta operação.';
  }

  // Authentication errors
  if (message.includes('jwt') || message.includes('auth') || message.includes('unauthorized')) {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  // Connection errors
  if (message.includes('connection') || message.includes('network') || message.includes('timeout')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Invalid input format
  if (message.includes('invalid input') || message.includes('malformed')) {
    return 'Formato de dados inválido. Verifique os campos e tente novamente.';
  }

  // Record not found
  if (message.includes('no rows') || message.includes('not found')) {
    return 'Registro não encontrado.';
  }

  // Default fallback - generic message that doesn't expose internal details
  return 'Ocorreu um erro ao processar sua solicitação.';
};

/**
 * Logs the full error for debugging while returning a safe user message
 * Use this in catch blocks to maintain debugging capability
 */
export const handleError = (error: unknown, logger: { error: (...args: unknown[]) => void }, context?: string): string => {
  // Log full error for debugging (only in development via logger)
  if (context) {
    logger.error(`Error in ${context}:`, error);
  } else {
    logger.error('Error:', error);
  }
  
  return getUserFriendlyError(error);
};
