import { Module } from '@nestjs/common';

import { ReportService } from './report.service';
import { PrinterServiceModule } from '../printer/printer.service.module';

@Module({
  imports: [PrinterServiceModule],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportServiceModule {}
