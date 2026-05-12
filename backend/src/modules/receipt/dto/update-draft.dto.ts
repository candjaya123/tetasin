import { IsOptional, IsString, IsNumber, IsArray, IsUUID } from 'class-validator';

export class UpdateDraftDto {
  @IsOptional()
  @IsString()
  merchant_name?: string;

  @IsOptional()
  @IsString()
  transaction_date?: string;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  receipt_number?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsUUID()
  debit_account_id?: string;

  @IsOptional()
  @IsUUID()
  credit_account_id?: string;

  @IsOptional()
  @IsArray()
  line_items?: any[];
}
