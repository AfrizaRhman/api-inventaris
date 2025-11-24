import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ItemMovementDetailDto {
  @IsString()
  @IsNotEmpty()
  sku_id: string;   // sesuai prisma: String

  @IsString()
  @IsOptional()
  item_id?: string; // sesuai prisma: String?

  // kalau sku_code memang tidak ada di prisma → hapus
  // kalau butuh tampilkan SKU code dari tabel lain → itu bukan input DTO
}
