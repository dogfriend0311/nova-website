const supabase = require('../supabase')
const { EmbedBuilder } = require('discord.js')

module.exports = async (message) => {
  const { data } = await supabase
    .from('transactions').select('*').order('created_at', { ascending: false }).limit(5)

  if (!data || data.length === 0) return message.reply('No transactions yet.')

  const icons = { signing: '✍️', trade: '🔄', promotion: '⬆️', release: '🚪' }

  const embed = new EmbedBuilder()
    .setTitle('📋 Latest Transactions')
    .setColor(0xCC0000)
    .addFields(data.map(tx => ({
      name: `${icons[tx.type?.toLowerCase()] || '📋'} ${tx.type} — ${tx.player_name}`,
      value: [
        tx.team_from && tx.team_to ? `${tx.team_from} → ${tx.team_to}` : '',
        tx.team_to && !tx.team_from ? `Signed to ${tx.team_to}` : '',
        tx.notes ? `*${tx.notes}*` : '',
        `<t:${Math.floor(new Date(tx.created_at).getTime() / 1000)}:R>`
      ].filter(Boolean).join('\n') || 'No details',
      inline: false
    })))

  message.reply({ embeds: [embed] })
}
