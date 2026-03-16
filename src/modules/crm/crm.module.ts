import { Module } from '@nestjs/common';
import { CRMService } from './crm.service';
import { LocalizationService } from './localization.service';

@Module({
    providers: [CRMService, LocalizationService],
    exports: [CRMService, LocalizationService],
})
export class CRMModule { }
