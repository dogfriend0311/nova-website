const supabase = require('../supabase')
const { EmbedBuilder } = require('discord.js')

module.exports = async (message, args) => {
  const teamName = args.join(' ')
  if (!teamName) return message.reply('Usage: `!roster [team name]`')

  const { data: players } = await supabase
    .from('players').select('name, positions').ilike('team', `%${teamName}%`).order('name')

  if (!players || players.length === 0)
    return message.reply(`No players found on **${teamName}**.`)

  const embed = new EmbedBuilder()
    .setTitle(`👥 ${teamName} — Roster`)
    .setColor(0xCC0000)
    .setDescription(players.map(p => `• **${p.name}**${p.positions ? ' — ' + p.positions : ''}`).join('\n'))
    .setFooter({ text: `${players.length} players` })

  message.reply({ embeds: [embed] })
}
