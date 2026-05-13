import { IsOptional, IsString, IsNumber, IsArray, IsEnum, IsUUID, Min, MaxLength } from 'class-validator';

export enum PaymentMethodEnum {
  CASH = 'cash',
  QRIS = 'qris',
  TRANSFER = 'transfer',
  CARD = 'card',
}

export class CreateManualDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  merchant_name?: string;

  @IsOptional()
  @IsString()
  transaction_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  payment_method?: PaymentMethodEnum;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  receipt_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
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
  line_items?: LineItemDto[];
}

export class LineItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(0)
  total: number;
}
