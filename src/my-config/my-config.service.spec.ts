import { Test, TestingModule } from '@nestjs/testing';
import { MyConfigService } from './my-config.service';

describe('MyConfigService', () => {
  let service: MyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyConfigService],
    }).compile();

    service = module.get<MyConfigService>(MyConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
