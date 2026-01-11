import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserRole } from '@infrastructure/database/schemas/user.schema';

/**
 * Permission mapping by role
 * Defines what actions each role can perform
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
        '*', // Admin has all permissions
    ],
    [UserRole.OWNER]: [
        'banquet:create',
        'banquet:read',
        'banquet:update',
        'banquet:delete',
        'own-profile:read',
        'own-profile:update',
    ],
    [UserRole.CUSTOMER]: [
        'banquet:read',
        'booking:create',
        'booking:read',
        'booking:update',
        'booking:delete',
        'own-profile:read',
        'own-profile:update',
    ],
};

/**
 * Permissions Guard
 * Implements fine-grained permission-based access control
 * Checks if user has specific permissions for resource:action
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get required permissions from decorator metadata
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            // No permissions required, allow access
            return true;
        }

        // Get user from request (attached by JWT guard)
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Get user's permissions based on role
        const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || [];

        // Admin wildcard permission
        if (userPermissions.includes('*')) {
            return true;
        }

        // Check if user has all required permissions
        const hasAllPermissions = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
        );

        if (!hasAllPermissions) {
            throw new ForbiddenException(
                `Access denied. Required permission(s): ${requiredPermissions.join(', ')}`,
            );
        }

        return true;
    }
}
