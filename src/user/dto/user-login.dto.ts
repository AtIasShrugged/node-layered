import { IsEmail, IsString } from 'class-validator'

export class UserLoginDto {
  @IsEmail({}, { message: 'email указан неверно' })
  email: string

  @IsString({ message: 'Некорректный пароль' })
  password: string
}
