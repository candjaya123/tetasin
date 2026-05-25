import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsUUID } from 'class-validator';

class ProductRecipeDto {
  @IsUUID()
  raw_material_id: string;

  @IsNumber()
  quantity_needed: number;
}

export class CreateProductDto {
  @IsString()
  p_name: string;

  @IsNumber()
  p_selling_price: number;

  @IsOptional()
  @IsNumber()
  p_cost_price?: number;

  @IsOptional()
  @IsString()
  p_sku?: string;

  @IsOptional()
  @IsString()
  p_barcode?: string;

  @IsOptional()
  @IsString()
  p_category?: string;

  @IsOptional()
  @IsNumber()
  p_reorder_point?: number;

  @IsOptional()
  @IsString()
  p_unit?: string;

  @IsOptional()
  @IsNumber()
  p_stock?: number;

  @IsOptional()
  @IsString()
  p_image_url?: string;

  @IsOptional()
  @IsArray()
  p_recipe?: ProductRecipeDto[];

  @IsOptional()
  @IsString()
  product_type?: string;

  @IsOptional()
  base_price_unit?: any;

  @IsOptional()
  @IsBoolean()
  track_stock?: boolean;
}

export class UpdateProductDto extends CreateProductDto {}

export class UpdateStockDto {
  @IsNumber()
  stock: number;
}
