import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Decorator
 * Marks endpoints with required permissions for fine-grained access control
 * 
 * @example
 * @RequirePermissions('banquet:create', 'banquet:update')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createBanquet() {}
 */
export const RequirePermissions = (...permissions: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
