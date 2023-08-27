import Ws from 'App/Services/Ws'
import { onlineUsersService } from 'App/Services/OnlineUsersService'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', async (socket) => {
  const ticket = socket.handshake.query.ticket

  // Vérifiez si le ticket est valide
  const validTicket = await Database.from('ws_tickets')
    .where('ticket', ticket as string)
    .andWhere('expiry', '>', DateTime.now().toSQL())
    .first()

  if (!validTicket) {
    socket.disconnect()
    return
  }

  // Supprimez le ticket pour qu'il ne puisse pas être réutilisé
  await Database.from('ws_tickets')
    .where('ticket', ticket as string)
    .delete()

  socket.on('add-user', (userId) => {
    onlineUsersService.addUser(userId, socket.id)
  })

  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsersService.getUser(data.receiver_id)
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-received', data)
    }
  })

  socket.on('joinGroup', (groupId) => {
    socket.join(`groupchat:${groupId}`)
  })
})
