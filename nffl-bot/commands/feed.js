const supabase = require('../supabase')
const { EmbedBuilder } = require('discord.js')

module.exports = async (message) => {
  const { data } = await supabase
    .from('game_feed').select('*').order('created_at', { ascending: false }).limit(5)

  if (!data || data.length === 0) return message.reply('No plays in the feed yet.')

  const icon = (t = '') => {
    const s = t.toLowerCase()
    if (s.includes('touchdown') || s.includes('td')) return '🏈'
    if (s.includes('interception')) return '🚨'
    if (s.includes('fumble')) return '💥'
    if (s.includes('field goal')) return '🎯'
    if (s.includes('sack')) return '💪'
    return '▶'
  }

  const embed = new EmbedBuilder()
    .setTitle('📡 Game Feed — Last 5 Plays')
    .setColor(0x00ff88)
    .setDescription(
      data.map(p =>
        `${icon(p.play_text)} ${p.player_name ? `**${p.player_name}** ` : ''}${p.play_text}${p.yards != null ? ` *(${p.yards > 0 ? '+' : ''}${p.yards} yds)*` : ''}${p.field_position ? ` 📍${p.field_position}` : ''}`
      ).join('\n\n')
    )

  message.reply({ embeds: [embed] })
}
