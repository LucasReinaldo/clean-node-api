import { EmailValidator, CreateAccount, AccountModel, CreateAccountModel } from './signup-protocols'
import { InvalidParamError, MissingParamError, ServerError } from '../errors'
import { SignUpController } from './signup'

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  createAccountStub: CreateAccount
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeCreateAccount = (): CreateAccount => {
  class CreateAccountStub implements CreateAccount {
    create (account: CreateAccountModel): AccountModel {
      const fakeAccount = {
        id: 'fake_id',
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest'
      }

      return fakeAccount
    }
  }

  return new CreateAccountStub()
}

/**
 *
 const makeEmailValidatorError = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      throw new Error()
    }
  }

  return new EmailValidatorStub()
}

-> Replaced by:
const { sut, emailValidatorStub } = makeSut()

jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
  throw new Error()
})
 */

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator()
  const createAccountStub = makeCreateAccount()

  const sut = new SignUpController(emailValidatorStub, createAccountStub)

  return {
    sut,
    emailValidatorStub,
    createAccountStub
  }
}

describe('SignUp Controller', () => {
  test('it should return 200 if data is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'fake_id',
      name: 'name test',
      email: 'mailtest@mail.com',
      password: 'passwordtest'
    })
  })

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

  test('it should return 400 if passwordConfirmation does not match', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'doesnotmatch'
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
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

  test('it should return 500 (server Error) if EmailValidator throws exceptioin', () => {
    const { sut, emailValidatorStub } = makeSut()

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })

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

  test('it should return 500 (server Error) if CreateAccount throws exceptioin', () => {
    const { sut, createAccountStub } = makeSut()

    jest.spyOn(createAccountStub, 'create').mockImplementationOnce(() => {
      throw new Error()
    })

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

  test('it should call CreateAccount adding data', () => {
    const { sut, createAccountStub } = makeSut()

    const spyCreate = jest.spyOn(createAccountStub, 'create')

    const httpRequest = {
      body: {
        name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    sut.handle(httpRequest)
    expect(spyCreate).toHaveBeenCalledWith({
      name: 'name test',
      email: 'mailtest@mail.com',
      password: 'passwordtest'
    })
  })
})
