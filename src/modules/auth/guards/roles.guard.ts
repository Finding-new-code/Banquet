import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@infrastructure/database/schemas/user.schema';

/**
 * Roles Guard
 * Implements Role-Based Access Control (RBAC)
 * Checks if authenticated user has required role(s)
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get required roles from decorator metadata
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            // No roles required, allow access
            return true;
        }

        // Get user from request (attached by JWT guard)
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        // Check if user has at least one of the required roles
        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}
