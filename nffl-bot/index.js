require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')

const stats = require('./commands/stats')
const career = require('./commands/career')
const roster = require('./commands/roster')
const transactions = require('./commands/transactions')
const feed = require('./commands/feed')
const help = require('./commands/help')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
})

client.once('ready', () => {
  console.log(`✅ NFFL Bot online as ${client.user.tag}`)
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return
  if (!message.content.startsWith('!')) return

  const args = message.content.slice(1).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  try {
    if (command === 'stats') await stats(message, args)
    else if (command === 'career') await career(message, args)
    else if (command === 'roster') await roster(message, args)
    else if (command === 'transactions') await transactions(message, args)
    else if (command === 'feed') await feed(message, args)
    else if (command === 'help') await help(message)
  } catch (err) {
    console.error(err)
    message.reply('Something went wrong. Try again!')
  }
})

// Keep alive ping
const http = require('http')
http.createServer((req, res) => res.end('alive')).listen(process.env.PORT || 3000)

client.login(process.env.DISCORD_TOKEN)
