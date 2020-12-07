import { InvalidParamError } from '../errors/invalid-param-error'
import { MissingParamError } from '../errors/missing-param-error'
import { ServerError } from '../errors/server-error'
import { EmailValidator } from '../protocols/email-validator'
import { SignUpController } from './signup'

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
  class EmailValidtorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  const emailValidatorStub = new EmailValidtorStub()

  const sut = new SignUpController(emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('SignUp Controller', () => {
  test('it should return 400 if name is not provided', () => {
    const { sut } = makeSut()

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
    const { sut } = makeSut()
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
    const { sut } = makeSut()
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
    const { sut } = makeSut()
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

  test('it should return 400 if an invalid email is not provided', () => {
    const { sut, emailValidatorStub } = makeSut()

    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('it should call EmailValidator with correct email', () => {
    const { sut, emailValidatorStub } = makeSut()

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    sut.handle(httpRequest)

    expect(isValidSpy).toHaveBeenCalledWith('mailtest@mail.com')
  })

  test('it should return 500 (server Error) if EmailValidator throws exceptioin', () => {
    class EmailValidtorStub implements EmailValidator {
      isValid (email: string): boolean {
        throw new Error()
      }
    }

    const emailValidatorStub = new EmailValidtorStub()

    const sut = new SignUpController(emailValidatorStub)

    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
