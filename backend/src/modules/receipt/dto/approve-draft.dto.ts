import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ApproveDraftDto {
  @IsOptional()
  @IsUUID()
  debit_account_id?: string;

  @IsOptional()
  @IsUUID()
  credit_account_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RejectDraftDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
