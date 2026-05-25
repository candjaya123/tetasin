import { IsArray, IsUUID, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsUUID()
  product_id: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsArray()
  selected_variants?: any[];

  @IsOptional()
  @IsArray()
  selected_addons?: any[];
}

export class PaymentLineDto {
  @IsUUID()
  account_id: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  method?: string;
}

export class ProcessSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentLineDto)
  payments?: PaymentLineDto[];

  @IsOptional()
  @IsUUID()
  payment_account_id?: string; // For backward compatibility

  @IsOptional()
  @IsUUID()
  revenue_account_id?: string;

  @IsOptional()
  @IsUUID()
  hpp_account_id?: string;

  @IsOptional()
  @IsUUID()
  inventory_account_id?: string;

  @IsOptional()
  @IsUUID()
  tax_account_id?: string;

  @IsOptional()
  @IsUUID()
  discount_account_id?: string;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  idempotency_key?: string;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsString()
  pesanan_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
