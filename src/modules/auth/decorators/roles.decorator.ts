import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@infrastructure/database/schemas/user.schema';

export const ROLES_KEY = 'roles';

/**
 * Roles Decorator
 * Marks endpoints with required roles for access control
 * 
 * @example
 * @Roles(UserRole.ADMIN, UserRole.OWNER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnlyEndpoint() {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
