import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { onlineUsersService } from 'App/Services/OnlineUsersService'

import Message from 'App/Models/Message'
import User from 'App/Models/User'

export default class MessagesController {
  public async storeMessage({ request, response }: HttpContextContract) {
    try {
      const { message, from, to } = request.body() // Récupère les paramètres de la requête
      const getUser = onlineUsersService.getUser(to) // Vérifie si l'utilisateur destinataire est en ligne

      if (message && from && to) {
        // Vérifie que tous les paramètres sont présents
        const newMessage = new Message()
        newMessage.message = message
        newMessage.senderId = from
        newMessage.receiverId = to
        newMessage.messageStatus = getUser ? 'delivered' : 'sent' // Définit le statut du message en fonction de l'état de connexion de l'utilisateur destinataire
        newMessage.messageType = 'text'

        await newMessage.save() // Enregistre le nouveau message dans la base de données

        return response.status(201).json(newMessage) // Renvoie le nouveau message créé
      } else {
        return response.status(400).json({ message: 'From, to and message is required' }) // Renvoie une erreur si les paramètres sont manquants
      }
    } catch (error) {
      console.log(error)
      return response.status(500).json({ message: 'Internal server error' }) // Renvoie une erreur en cas d'erreur interne du serveur
    }
  }

  public async getMessages({ request, response }: HttpContextContract) {
    try {
      const { from, to } = request.qs() // Récupère les paramètres de la requête

      if (from && to) {
        // Vérifie que les deux paramètres sont présents
        const messages = await Message.query()
          .where((query) => {
            query.where('sender_id', from).andWhere('receiver_id', to)
          })
          .orWhere((query) => {
            query.where('sender_id', to).andWhere('receiver_id', from)
          }) // Récupère les messages entre les deux utilisateurs

        const unreadMessages = [] as number[] // Initialise un tableau pour stocker les messages non lus

        messages.forEach((message, index) => {
          if (message.messageStatus !== 'read' && message.senderId === parseInt(to)) {
            messages[index].messageStatus = 'read' // Met à jour le statut du message à "lu"
            unreadMessages.push(message.id) // Ajoute l'ID du message non lu au tableau
          }
        }) // Parcourt les messages pour trouver ceux qui n'ont pas été lus

        if (unreadMessages.length > 0) {
          await Message.query().whereIn('id', unreadMessages).update({ messageStatus: 'read' }) // Met à jour le statut des messages non lus dans la base de données
        }

        return response.status(200).json(messages) // Renvoie les messages récupérés
      } else {
        return response.status(400).json({ message: 'From and to is required' }) // Renvoie une erreur si les paramètres sont manquants
      }
    } catch (error) {
      console.log(error)
      return response.status(500).json({ message: 'Internal server error' }) // Renvoie une erreur en cas d'erreur interne du serveur
    }
  }

  public async storeImageMessage({ request, response }: HttpContextContract) {
    try {
      const { from, to } = request.qs() // Récupère les paramètres de la requête
      const image = request.file('image', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'gif'],
      }) // Récupère le fichier image envoyé

      if (image && from && to) {
        if (!image.isValid) {
          return response.status(400).json({ message: 'Invalid file type' }) // Renvoie une erreur si le fichier n'est pas valide
        }

        const newFileName = `${new Date().getTime()}.${image.extname}`

        await image.move('./uploads/images', {
          name: newFileName,
        })

        const newMessage = new Message()
        newMessage.message = newFileName
        newMessage.senderId = from
        newMessage.receiverId = to
        newMessage.messageStatus = 'sent'
        newMessage.messageType = 'image'

        await newMessage.save() // Enregistre le nouveau message dans la base de données

        return response.status(201).json(newMessage) // Renvoie le nouveau message créé*/
      } else {
        return response.status(400).json({ message: 'From, to and image is required' }) // Renvoie une erreur si les paramètres sont manquants
      }
    } catch (error) {
      console.log(error)
      return response.status(500).json({ message: 'Internal server error' }) // Renvoie une erreur en cas d'erreur interne du serveur
    }
  }

  public async storeAudioMessage({ request, response }: HttpContextContract) {
    try {
      const { from, to } = request.qs() // Récupère les paramètres de la requête
      const audio = request.file('audio', {
        size: '5mb',
        extnames: ['mp3', 'wav', 'webm'],
      }) // Récupère le fichier audio envoyé

      if (audio && from && to) {
        if (!audio.isValid) {
          return response.status(400).json({ message: 'Invalid file type' }) // Renvoie une erreur si le fichier n'est pas valide
        }

        const newFileName = `${new Date().getTime()}.${audio.extname}`

        await audio.move('./uploads/audios', {
          name: newFileName,
        })

        const newMessage = new Message()
        newMessage.message = newFileName
        newMessage.senderId = from
        newMessage.receiverId = to
        newMessage.messageStatus = 'sent'
        newMessage.messageType = 'audio'

        await newMessage.save() // Enregistre le nouveau message dans la base de données

        return response.status(201).json(newMessage) // Renvoie le nouveau message créé*/
      } else {
        return response.status(400).json({ message: 'From, to and audio is required' }) // Renvoie une erreur si les paramètres sont manquants
      }
    } catch (error) {
      console.log(error)
      return response.status(500).json({ message: 'Internal server error' }) // Renvoie une erreur en cas d'erreur interne du serveur
    }
  }

  public async getInitialContactsWithMessages({ request, response }: HttpContextContract) {
    try {
      const { userId } = request.qs()

      const messages = await Message.query()
        .where((query) => {
          query.where('sender_id', userId).orWhere('receiver_id', userId)
        })
        .preload('receiver')
        .preload('sender')
        .orderBy('created_at', 'desc')
        .limit(10)

      const users = new Map()
      const messageStatusChange = [] as number[]

      messages.forEach((msg) => {
        const isSender = msg.senderId === userId
        const calculatedId = isSender ? msg.receiverId : msg.senderId

        if (msg.messageStatus === 'sent') {
          messageStatusChange.push(msg.id)
        }

        if (!users.get(calculatedId)) {
          const user = {
            ...msg.serialize(),
            ...(isSender ? msg.receiver.serialize() : msg.sender.serialize()),
            totalUnreadMessages: isSender ? 0 : msg.messageStatus !== 'read' ? 1 : 0,
          }
          users.set(calculatedId, user)
        } else if (msg.messageStatus !== 'read' && !isSender) {
          const user = users.get(calculatedId)
          user.totalUnreadMessages += 1
          users.set(calculatedId, user)
        }
      })

      if (messageStatusChange.length) {
        await Message.query()
          .whereIn('id', messageStatusChange)
          .update({ messageStatus: 'delivered' })
      }

      // Assuming you have a way to get online users in AdonisJS similar to your previous setup
      const onlineUsers = [] // Replace with your method to get online users

      return response.status(200).json({
        users: Array.from(users.values()),
        onlineUsers: onlineUsers,
      })
    } catch (error) {
      console.log(error)
      return response.status(500).json({ message: 'Internal server error' })
    }
  }
}
