import { ConfigService } from './config.service';

describe('ConfigService', () => {
  describe('constructor', () => {
    let configService;

    it('missing variables', () => {
      expect(() => new ConfigService({})).toThrowError('');
    });

    it('all variables defined', () => {
      configService = new ConfigService({
        NODE_ENV: 'production',
        MONGODB_HOST: 'mongodb://localhost:27017',
        MONGODB_DATABASE: 'passprotect',
        JWT_SECRET: 'zaealsdfjklsklsdklEAZER13E31',
      });

      expect(configService.createMongooseOptions()).toMatchSnapshot(
        'mongooseOptions',
      );
      expect(configService.createJwtOptions()).toMatchSnapshot('jwtOptions');
    });
  });
});
