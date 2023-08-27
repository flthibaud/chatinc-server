import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class WsTickets extends BaseSchema {
  protected tableName = 'ws_tickets'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('ticket', 250).notNullable().unique() // Colonne pour le ticket (UUID)
      table.integer('user_id').unsigned().references('id').inTable('users') // Référence à l'utilisateur
      table.timestamp('expiry', { useTz: true }).notNullable() // Date d'expiration du ticket

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
