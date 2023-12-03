// exists-in-database.validator.ts
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationOptions,
    registerDecorator,
    ValidationArguments,
  } from 'class-validator';
  import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
  
  
  @ValidatorConstraint({ async: true })
  @Injectable()
  export class ExistsInDatabaseConstraint implements ValidatorConstraintInterface {
     prisma = new PrismaClient();
    constructor() {}
  
    async validate(value: any, args: ValidationArguments) {
      const [tableName] = args.constraints;
      const record = await this.prisma['folder'].findFirst({ where: { id: value } });
      return !!record;
    }
  
    defaultMessage(args: ValidationArguments) {
      const [tableName] = args.constraints;
      return `${tableName} with id ${args.value} does not exist.`;
    }
  }
  
  export function ExistsInDatabase(tableName: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [tableName],
        validator: ExistsInDatabaseConstraint,
      });
    };
  }
  