import { MissingParamError } from '../errors/missing-param-error'
import { SignUpController } from './signup'

describe('SignUp Controller', () => {
  test('it should return 400 if name is not provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('it should return 400 if email is not provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: 'name test',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('it should return 400 if password is not provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        // password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('it should return 400 if passwordConfirmation is not provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest'
        // passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })
})
