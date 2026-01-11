import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, IsPhoneNumber, IsOptional } from 'class-validator';

export enum OtpTypeEnum {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE',
}

export class SendOtpDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email address or phone number'
    })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiProperty({
        enum: OtpTypeEnum,
        example: OtpTypeEnum.EMAIL,
        description: 'OTP type (EMAIL or PHONE)'
    })
    @IsEnum(OtpTypeEnum)
    @IsNotEmpty()
    type: OtpTypeEnum;
}

export class VerifyOtpDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email address or phone number'
    })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiProperty({
        example: '123456',
        description: '6-digit OTP code'
    })
    @IsString()
    @Length(6, 6, { message: 'OTP must be 6 digits' })
    @IsNotEmpty()
    otp: string;

    @ApiProperty({
        enum: OtpTypeEnum,
        example: OtpTypeEnum.EMAIL,
        description: 'OTP type (EMAIL or PHONE)'
    })
    @IsEnum(OtpTypeEnum)
    @IsNotEmpty()
    type: OtpTypeEnum;
}
