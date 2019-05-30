import * as Joi from '@hapi/joi';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { JwtOptionsFactory, JwtModuleOptions } from '@nestjs/jwt';

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService implements MongooseOptionsFactory, JwtOptionsFactory {
  private readonly envConfig: EnvConfig;

  constructor(environments: EnvConfig) {
    this.envConfig = this.validateInput(environments);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test'])
        .default('development'),
      MONGODB_HOST: Joi.string().required(),
      MONGODB_DATABASE: Joi.string().optional(),
      JWT_SECRET: Joi.string().required(),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(envConfig, envVarsSchema, { allowUnknown: true });
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get mongodbHost(): string {
    return this.envConfig.MONGODB_HOST;
  }

  get mongodbDatabase(): string {
    return this.envConfig.MONGODB_DATABASE;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.mongodbHost + '/' + this.mongodbDatabase,
      useNewUrlParser: true,
    };
  }

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.jwtSecret,
      signOptions: {
        expiresIn: 3600,
      },
    };
  }
}
