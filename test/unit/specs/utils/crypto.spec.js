import { createKeyDerivation, generateIV, generateKey, generatePassword, encrypt, decrypt } from '@/utils/crypto'
import { expect } from 'chai'

const config = {
  pbkdf2: {
    iterations: 1000,
    keylen: 256,
    ivlen: 96,
    digest: 'sha512'
  },
  cypherIv: {
    algorithm: 'AES-256-GCM'
  },
  ivSize: 64,
  keySize: 256
}

describe('crypto.js', () => {
  describe('#createKeyDerivation', () => {
    const createKeyDerivationTestCase = [
      { salt: 'salt1', password: 'password1', expect: { key: '2f75fffe5d3d0564a5ab0985521a6fa6dd802e87eb47cb962529f818ada4a9bb', iv: '5f16b7caa1aaf79bcfd45e2d' } },
      { salt: 'salt2', password: 'password1', expect: { key: '69616b6c1943f28710e293a927b0331ecf8662908feaf343dd921d0ff3cf547f', iv: '47c1d6031616b30026bbd515' } },
      { salt: 'salt3', password: 'password1', expect: { key: 'fe0822d26b2d2e398da9230f6f0283f092361269c00893ab64fe5e2e12941254', iv: 'd803b742eb602e58f38d09be' } },
      { salt: 'salt1', password: 'password2', expect: { key: '0cf0dacc68068c44b3da8b26374de8f5a0520eea608af2522acfc846e2a98585', iv: '194aec906bc1561ec1a883ee' } },
      { salt: 'salt4', password: 'password2', expect: { key: '4c1c768473c929455b3053beaf88507c653a60969b3a9282694370a51aaf245c', iv: '5859df4b660659a270ff31c7' } }
    ]

    createKeyDerivationTestCase.forEach(value => {
      it(`Create a derivation key from a password ${value.password} and a salt ${value.salt}`, async () => {
        const key = await createKeyDerivation(value.password, value.salt, config.pbkdf2)
        expect(key).to.deep.equal(value.expect)
      })
    })
  })

  describe('#generateIV', () => {
    const generateIVTestCase = [256, 512, 1024, 2048]

    generateIVTestCase.forEach(value => {
      it(`Generate the IV for size ${value}`, async () => {
        const iv = await generateIV(value)
        expect(iv.length).to.equal(value / 4)
      })
    })
  })

  describe('#generateKey', () => {
    const generateKeyTestCase = [256, 512, 1024, 2048]

    generateKeyTestCase.forEach(value => {
      it(`Generate the Key for size ${value}`, async () => {
        const key = await generateKey(value)
        expect(key.length).to.equal(value / 4)
      })
    })
  })

  describe('#generatePassword', () => {
    const generatePasswordTestCase = [128, 256, 512, 1024, 2048]

    generatePasswordTestCase.forEach(value => {
      it(`Generate a password of a size ${value}`, async () => {
        const password = await generatePassword(value)
        expect(password.length).to.equal(value / 8)
        expect(password).to.match(/[a-zA-Z0-9!"#$%&\\'()*+,-./:;<=>?@\[\\\]\^_`{|}~]+/) // eslint-disable-line
      })
    })
  })

  describe('#encrypt', () => {
    const options = config.cypherIv
    const encryptTestCase = [
      {text: 'text to encrypt', key: '2f75fffe5d3d0564a5ab0985521a6fa6dd802e87eb47cb962529f818ada4a9bb', iv: '5f16b7caa1aaf79bcfd45e2d', expect: {content: '65d73be2490996f24b7f54e0ac48f6', authTag: 'ada3386bd63223e7ea6923767c00128a'}},
      {text: 'text to encrypt 2', key: '69616b6c1943f28710e293a927b0331ecf8662908feaf343dd921d0ff3cf547f', iv: '47c1d6031616b30026bbd515', expect: {content: '74c25b24ede8b230098342fc08efd8849e', authTag: '699464d3e976ac8599a6a66c4aeaf099'}},
      {text: 'text to encrypt 3', key: '0cf0dacc68068c44b3da8b26374de8f5a0520eea608af2522acfc846e2a98585', iv: '194aec906bc1561ec1a883ee', expect: {content: '9b84e950bccd646c87335f32b9d7f1b19c', authTag: '3ada8b5ba241c570fb76f4f7b4b08f97'}}
    ]

    encryptTestCase.forEach(value => {
      it(`Test encryption of ${value.text}`, async () => {
        const encryptedObject = await encrypt(value.text, value.key, value.iv, options)
        expect(encryptedObject).to.deep.equal(value.expect)
      })
    })
  })

  describe('#decrypt', () => {
    const options = config.cypherIv
    const decryptTestCase = [
      {text: 'text to encrypt', key: '2f75fffe5d3d0564a5ab0985521a6fa6dd802e87eb47cb962529f818ada4a9bb', iv: '5f16b7caa1aaf79bcfd45e2d', encryptedData: {content: '65d73be2490996f24b7f54e0ac48f6', authTag: 'ada3386bd63223e7ea6923767c00128a'}},
      {text: 'text to encrypt 2', key: '69616b6c1943f28710e293a927b0331ecf8662908feaf343dd921d0ff3cf547f', iv: '47c1d6031616b30026bbd515', encryptedData: {content: '74c25b24ede8b230098342fc08efd8849e', authTag: '699464d3e976ac8599a6a66c4aeaf099'}},
      {text: 'text to encrypt 3', key: '0cf0dacc68068c44b3da8b26374de8f5a0520eea608af2522acfc846e2a98585', iv: '194aec906bc1561ec1a883ee', encryptedData: {content: '9b84e950bccd646c87335f32b9d7f1b19c', authTag: '3ada8b5ba241c570fb76f4f7b4b08f97'}}
    ]

    decryptTestCase.forEach(value => {
      it(`Test decryption of ${value.text}`, async () => {
        const decryptedObject = await decrypt(value.encryptedData, value.key, value.iv, options)
        expect(decryptedObject.toString()).to.equal(value.text)
      })
    })
  })
})
