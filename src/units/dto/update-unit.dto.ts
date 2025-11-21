import { IsNotEmpty, IsString } from 'class-validator';


export class UpdateUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
