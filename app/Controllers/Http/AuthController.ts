import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import LoginValidator from 'App/Validators/Auth/LoginValidator'
import StoreUserValidator from 'App/Validators/Auth/StoreUserValidator'
import Database from '@ioc:Adonis/Lucid/Database'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'

import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate(StoreUserValidator)

    const user = await User.create(payload)

    user.password = await Hash.make(payload.password)

    await user.save()

    return response.created({
      message: 'User created successfully',
      data: user,
    })
  }

  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = await request.validate(LoginValidator)

    const token = await auth.attempt(email, password, {
      expiresIn: '7 days',
    })
    const user = auth.user!

    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.ok({
      message: 'Logout successfully',
    })
  }

  public async getUser({ auth, response }: HttpContextContract) {
    const user = auth.user!

    return response.ok({
      data: user,
    })
  }

  public async getWebSocketTicket({ auth, response }: HttpContextContract) {
    const user = auth.user!

    if (!user) {
      return response.forbidden('Vous devez être connecté pour obtenir un ticket.')
    }

    const ticket = {
      ticket: uuidv4(),
      expiry: DateTime.now().plus({ minutes: 10 }).toISO(),
      user_id: user?.id,
    }

    // Stockez le ticket dans la base de données avec l'heure d'expiration
    await Database.table('ws_tickets').insert({ ...ticket })

    return response.json({ ticket })
  }
}
