import { App } from '../src/app'
import { boot } from '../src/main'
import request from 'supertest'

let application: App

beforeAll(async () => {
  const { app } = await boot
  application = app
})

const emailMock = 'test123@test.test'
const passwordMock = 'qwerty'
// пользователь был создан в бд заранее вручную
describe('Users e2e', () => {
  it('Register - error', async () => {
    const res = await request(application.app)
      .post('/users/register')
      .send({ email: emailMock, password: passwordMock })
    expect(res.statusCode).toBe(422)
  })

  it('Login - success', async () => {
    const res = await request(application.app)
      .post('/users/login')
      .send({ email: emailMock, password: passwordMock })
    expect(res.body.jwt).not.toBeUndefined()
  })

  it('Login - error', async () => {
    const res = await request(application.app)
      .post('/users/login')
      .send({ email: emailMock, password: 'wrongPassword' })
    expect(res.statusCode).toBe(401)
  })

  it('Info - success', async () => {
    const user = await request(application.app)
      .post('/users/login')
      .send({ email: emailMock, password: passwordMock })
    const res = await request(application.app)
      .get('/users/info')
      .set('Authorization', `Bearer ${user.body.jwt}`)
    expect(res.body.email).toBe(emailMock)
  })

  it('Info - error', async () => {
    const res = await request(application.app).get('/users/info').set('Authorization', `Bearer qwe`)
    expect(res.statusCode).toBe(401)
  })
})

afterAll(() => {
  application.close()
})
