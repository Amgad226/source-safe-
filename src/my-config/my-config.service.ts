import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvEnum } from './env-enum';

@Injectable()
export class MyConfigService {
  constructor(private configService: ConfigService){}
  get(envEnum: EnvEnum): string {
    return this.configService.get(envEnum);
  }
}
