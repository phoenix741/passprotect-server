import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService();
  });

  describe('hashPassword, checkPassword', () => {
    it('success', async () => {
      const password = await cryptoService.hashPassword('mon mot de passe');
      expect(await cryptoService.checkPassword('mon mot de passe', password)).toBeTruthy();
    });

    it('failed', async () => {
      const password = await cryptoService.hashPassword('mon mot de passe');
      expect(await cryptoService.checkPassword('mon mot de passe 2', password)).toBeFalsy();
    });
  });
});
