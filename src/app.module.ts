import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiskSpaceController } from './disk-space.controller';

@Module({
  imports: [],
  controllers: [AppController,DiskSpaceController],
  providers: [AppService],
})
export class AppModule {}
