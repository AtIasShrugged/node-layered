import 'reflect-metadata'
import { UserModel } from '@prisma/client'
import { Container } from 'inversify'
import { IConfigService } from '../config/config.service.interface'
import { TYPES } from '../types'
import { User } from './user.entity'
import { IUserRepository } from './user.repository.interface'
import { UserService } from './user.service'
import { IUserService } from './user.service.interface'
import { UserLoginDto } from './dto/user-login.dto'

const ConfigServiceMock: IConfigService = {
  get: jest.fn(),
}

const UserRepositoryMock: IUserRepository = {
  create: jest.fn(),
  find: jest.fn(),
}

const container = new Container()
let userService: IUserService
let configService: IConfigService
let userRepository: IUserRepository

beforeAll(() => {
  container.bind<IUserService>(TYPES.UserService).to(UserService)
  container.bind<IConfigService>(TYPES.ConfigService).toConstantValue(ConfigServiceMock)
  container.bind<IUserRepository>(TYPES.UserRepository).toConstantValue(UserRepositoryMock)

  userService = container.get<IUserService>(TYPES.UserService)
  configService = container.get<IConfigService>(TYPES.ConfigService)
  userRepository = container.get<IUserRepository>(TYPES.UserRepository)
})

const idMock: number = 3
const emailMock: string = 'test123@test.test'
const nameMock: string = 'asd'
const passwordMock: string = 'qwerty'
const hashMock: string = '$2a$10$qSW.ehngVZqVCCwmQwNeg.1g9DUq6jn2nBP9FEtInAwJDT8rKXgjW'

describe('User Service', () => {
  it('createUser', async () => {
    configService.get = jest.fn().mockReturnValueOnce('1')
    userRepository.create = jest.fn().mockImplementationOnce(
      (user: User): UserModel => ({
        id: 3,
        email: user.email,
        name: user.name,
        password: user.password,
      })
    )

    const createdUser = await userService.createUser({
      email: emailMock,
      name: nameMock,
      password: passwordMock,
    })

    expect(createdUser?.id).toEqual(3)
    expect(createdUser?.password).not.toEqual('qwerty')
  })

  it('validateUser - passwords equal', async () => {
    const userMock: UserLoginDto = { email: emailMock, password: passwordMock }

    userRepository.find = jest.fn().mockImplementationOnce((email: string): UserModel | null => ({
      id: idMock,
      email,
      name: nameMock,
      password: hashMock,
    }))

    const isPasswordsEqual = await userService.validateUser(userMock)

    expect(isPasswordsEqual).toBeTruthy
  })

  it('validateUser - passwords not equal', async () => {
    const userMock: UserLoginDto = { email: emailMock, password: 'wrongPassword' }

    userRepository.find = jest.fn().mockImplementationOnce((email: string): UserModel | null => ({
      id: idMock,
      email,
      name: nameMock,
      password: hashMock,
    }))

    const isPasswordsEqual = await userService.validateUser(userMock)

    expect(isPasswordsEqual).toBeFalsy
  })

  it('validateUser - user not found', async () => {
    const userMock: UserLoginDto = { email: 'wrong@email', password: passwordMock }

    userRepository.find = jest.fn().mockReturnValueOnce(null)

    const isPasswordsEqual = await userService.validateUser(userMock)

    expect(isPasswordsEqual).toBeFalsy
  })
})
