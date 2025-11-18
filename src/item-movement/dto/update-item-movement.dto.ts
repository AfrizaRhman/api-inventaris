import { PartialType } from '@nestjs/mapped-types';
import { CreateItemMovementDto } from './create-item-movement.dto';

export class UpdateItemMovementDto extends PartialType(CreateItemMovementDto) {}
