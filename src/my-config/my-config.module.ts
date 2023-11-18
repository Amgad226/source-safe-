import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MyConfigService } from './my-config.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [ConfigService, MyConfigService],  
  exports: [MyConfigService],
})
export class MyConfigModule {}
