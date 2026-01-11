import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class AuthResponseDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @Expose()
    accessToken: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @Expose()
    refreshToken: string;

    @ApiProperty({
        description: 'User data without sensitive information',
        example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'user@example.com',
            role: 'CUSTOMER',
            status: 'ACTIVE',
        }
    })
    @Expose()
    user: {
        id: string;
        email: string;
        role: string;
        status: string;
        ownerProfile?: any;
        customerProfile?: any;
    };
}

export class UserResponseDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    role: string;

    @ApiProperty()
    @Expose()
    status: string;

    @ApiProperty({ required: false })
    @Expose()
    ownerProfile?: any;

    @ApiProperty({ required: false })
    @Expose()
    customerProfile?: any;

    @Exclude()
    password: string;

    @Exclude()
    deletedAt?: Date;

    @Exclude()
    createdBy?: string;

    @Exclude()
    updatedBy?: string;
}
