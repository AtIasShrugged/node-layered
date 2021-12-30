import { IsEmail, IsString } from 'class-validator'

export class UserRegisterDto {
  @IsEmail({}, { message: 'email указан неверно' })
  email: string

  @IsString({ message: 'Пароль не указан' })
  password: string

  @IsString({ message: 'Имя не указано' })
  name: string
}
