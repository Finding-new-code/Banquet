import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public Decorator
 * Marks endpoints as public (skip JWT authentication)
 * 
 * @example
 * @Public()
 * async publicEndpoint() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
