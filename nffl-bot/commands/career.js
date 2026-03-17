const supabase = require('../supabase')
const { EmbedBuilder } = require('discord.js')

module.exports = async (message, args) => {
  const playerName = args.join(' ')
  if (!playerName) return message.reply('Usage: `!career [player name]`')

  const { data: player } = await supabase
    .from('players').select('*').ilike('name', `%${playerName}%`).single()

  if (!player) return message.reply(`No player found named **${playerName}**.`)

  const [passing, rushing, receiving, defensive, kicking] = await Promise.all([
    supabase.from('passing_stats').select('*').eq('player_id', player.id).eq('season', 'career').maybeSingle(),
    supabase.from('rushing_stats').select('*').eq('player_id', player.id).eq('season', 'career').maybeSingle(),
    supabase.from('receiving_stats').select('*').eq('player_id', player.id).eq('season', 'career').maybeSingle(),
    supabase.from('defensive_stats').select('*').eq('player_id', player.id).eq('season', 'career').maybeSingle(),
    supabase.from('kicking_stats').select('*').eq('player_id', player.id).eq('season', 'career').maybeSingle(),
  ])

  const embed = new EmbedBuilder()
    .setTitle(`🏆 ${player.name} — Career Stats`)
    .setColor(0xCC0000)
    .setFooter({ text: `${player.team || 'No team'}${player.positions ? ' · ' + player.positions : ''}` })

  if (passing.data) embed.addFields({ name: '📤 Passing', value: `Comp: **${passing.data.completions}/${passing.data.attempts}** | Yds: **${passing.data.passing_yards}** | TDs: **${passing.data.touchdowns}** | INTs: **${passing.data.interceptions}**`, inline: false })
  if (rushing.data) embed.addFields({ name: '🏃 Rushing', value: `Car: **${rushing.data.carries}** | Yds: **${rushing.data.rushing_yards}** | TDs: **${rushing.data.rushing_tds}**`, inline: false })
  if (receiving.data) embed.addFields({ name: '🙌 Receiving', value: `Rec: **${receiving.data.receptions}** | Yds: **${receiving.data.receiving_yards}** | TDs: **${receiving.data.receiving_tds}**`, inline: false })
  if (defensive.data) embed.addFields({ name: '🛡️ Defense', value: `Tkl: **${defensive.data.tackles}** | Sacks: **${defensive.data.sacks}** | INTs: **${defensive.data.interceptions}**`, inline: false })

  message.reply({ embeds: [embed] })
}
