# Passprotect

Passprotect is an single page application used to retrieve and store password, credit card, or other text securely.

## How data are encrypted

When the application is started you can create a user. When the user is created the application will create 2 keys :

  * the master key used to encrypt (with AES-256-CTR) password, text, card. This key is generated from 32 random bytes, 
  this key is encrypted using the password of the user and salt (of 16 bytes),
  * the session key used to encrypt JWT token. The key is generated from 32 random bytes. This key is used to encrypt 
  the master key in the JWT token.
  
Then when the line is saved the master key is used to encrypt the data, and when the line is retrieved the master key is
used to decrypt the data.

Only the user can encrypt and decrypt it's data. The encryption and decryption is made in the nodejs part. 

## Installation

### Prerequisites

 * NodeJS > 6.2.1
 * MongoDB > 3.2.7

### From source

```bash
    $ hg clone https://bitbucket.org/uvandenhekke/passprotect-server
    $ npm install
    $ MODE=prod npm run build
```

### From docker

Using docker-compose you can instantiate the different image with the following `docker-compose.yml` file

```yaml
version: '2'
services:
    nodejs:
        image: phoenix741/passprotect-server:1.0.0
        expose:
            - 3000
        links:
            - mongodb
        environment:
            - MONGODB_HOST=mongodb://mongodb:27017/passprotect
            - NODE_ENV=production
            - DEBUG=App:*
            - JWT_SECRET=dnLUMtULQsNmNbmGV3Lx8SxrxEtaxTc8aPdRh8YMemj515Faip7wQYueSaBFYm5r
            - CRYPTO_SESSIONKEY=xtipKI38GUCvE5cNGtTJxa1wQFvCicF5GDLTWyaBAb5RQqQ8rRBR1yVEq7Jg10cu
    nginx:
        image: phoenix741/passprotect-client:1.0.0
        links:
            - nodejs
        environment:
            - UPSTREAM_SERVER=nodejs
            - UPSTREAM_PORT=3000
        ports:
            - '8080:80'
    mongodb:
        image: mongo:3.3.9
        expose:
            - 27017
        volumes:
            - './mongodb:/data'
```

There is two images :

 * `docker.shadoware.org/passprotect-server:1.0.0`: contains the server part with nodejs.
 * `docker.shadoware.org/passprotect-client:1.0.0`: serve the static file of the client and is used as a proxy to the API
  
The third image is used to contains the mongodb database.

## Usage

Access to `http://localhost:8080` from your browser.
