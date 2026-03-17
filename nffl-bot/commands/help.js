const { EmbedBuilder } = require('discord.js')

module.exports = async (message) => {
  const embed = new EmbedBuilder()
    .setTitle('🏈 NFFL Bot — Commands')
    .setColor(0xCC0000)
    .addFields(
      { name: '!stats [player]', value: 'Current season stats', inline: false },
      { name: '!career [player]', value: 'Career stats', inline: false },
      { name: '!roster [team]', value: 'Full team roster', inline: false },
      { name: '!transactions', value: 'Last 5 transactions', inline: false },
      { name: '!feed', value: 'Last 5 plays from game feed', inline: false },
      { name: '!help', value: 'Show this message', inline: false },
    )
    .setFooter({ text: 'Nova Football Fusion League' })

  message.reply({ embeds: [embed] })
}
