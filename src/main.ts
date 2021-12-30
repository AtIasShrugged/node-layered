import { Container, ContainerModule, interfaces } from 'inversify'
import { App } from './app'
import { ConfigService } from './config/config.service'
import { IConfigService } from './config/config.service.interface'
import { PrismaService } from './database/prisma.service'
import { ExceptionFilter } from './errors/exception.filter'
import { IExceptionFilter } from './errors/exception.filter.interface'
import { ILogger } from './logger/logger.interface'
import { LoggerService } from './logger/logger.service'
import { TYPES } from './types'
import { UserController } from './user/user.controller'
import { IUserController } from './user/user.controller.interface'
import { UserRepository } from './user/user.repository'
import { UserService } from './user/user.service'
import { IUserService } from './user/user.service.interface'
import { IUserRepository } from './user/user.repository.interface'

export interface IMainReturn {
  appContainer: Container
  app: App
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope()
  bind<IExceptionFilter>(TYPES.IExceptionFilter).to(ExceptionFilter)
  bind<IUserController>(TYPES.UserController).to(UserController)
  bind<IUserService>(TYPES.UserService).to(UserService)
  bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope()
  bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope()
  bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope()
  bind<App>(TYPES.Application).to(App)
})

async function main(): Promise<IMainReturn> {
  const appContainer = new Container()
  appContainer.load(appBindings)
  const app = appContainer.get<App>(TYPES.Application)
  await app.init()
  return { app, appContainer }
}

export const boot = main()
