import { SignUpController } from './signup'

describe('SignUp Controller', () => {
  test('should return 400 if name is not provided', () => {
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        // name: 'name test',
        email: 'mailtest@mail.com',
        password: 'passwordtest',
        passwordConfirmation: 'passwordtest'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })
})
