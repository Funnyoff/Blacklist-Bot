const { Client, Intents } = require('discord.js');
const Discord = require("discord.js")
const db = require('quick.db')
const config = require('./config.json')

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING],
    restTimeOffset: 0,
    partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"]
});

client.login(config.token)

client.on('ready', async (client) => {
    console.log(`${client.user.username} connécté | Créer par Funny`)
    console.log(`Invite: https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`)
})


client.on('message', async (message) => {

    const pf = config.prefix
    const args = message.content.slice(pf.length).trim().split(/ +/g);
    const owner = config.owner

    if (owner.includes(message.author.id)) {

        if (message.content.startsWith(`${pf}bl`)) {

            if (args[1]) {

                const member = message.mentions.members.first() || message.guild.members.cache.get(args[1])

                if (!member) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``)
                if (db.get(`blacklist.${member.id}`) === member.id) { return message.channel.send(`${member.username} est déjà blacklist`) }

                db.push(`FUNNY.blacklist`, member.id)
                db.set(`blacklist.${member.id}`, member.id)
                member.kick(`Blacklist par ${message.author.username}`)
                message.channel.send(`<@${member.id}> est maintenant blacklist`)
                return
            }

            let funny = db.get(`FUNNY.blacklist`)

            let embed = new Discord.MessageEmbed()
                .setTitle("Blacklist")
                .setColor('ff0000')
                .setDescription(!funny ? "Aucun" : funny.map((user, i) => `<@${user}>`).slice(0, 30).join("\n"))
                .setFooter({ text: `Créer par Funny` })
            message.channel.send({ embeds: [embed] })

        }

        if (message.content.startsWith(`${pf}unbl`)) {

            if (args[1]) {

                let member = client.users.cache.get(message.author.id);
                if (args[1]) {
                    member = client.users.cache.get(args[1]);
                } else {
                    return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``)

                }

                if (message.mentions.members.first()) {
                    member = client.users.cache.get(message.mentions.members.first().id);
                }
                if (!member) return message.channel.send(`Aucun membre trouvé pour \`${args[1] || "rien"}\``)
                if (db.get(`blacklist.${member.id}`) === null) { return message.channel.send(`${member.username} n'est pas blacklist`) }
                db.set(`FUNNY.blacklist`, db.get(`FUNNY.blacklist`).filter(s => s !== member.id))
                db.delete(`blacklist.${member.id}`, member.id)

                message.channel.send(`**__${member.username}__** est maintenant unblacklist`)
            }
        }
    }

    if (message.content.startsWith(`${pf}help`)) {

        const embed = new Discord.MessageEmbed()
            .setTitle(`Commandes Blacklist bot`)
            .addField(`${pf}bl <ID/mention>`, `Blacklist un membre, une fois le membre blacklist il ne pourra rejoindre aucun serveur où se trouve le bot`)
            .addField(`${pf}unbl <ID>`, `Retire un membre de blacklist`)
            .setFooter({ text: `Créer par Funny` })
            .setColor('ff0000')
        message.channel.send({ embeds: [embed] })
    }
})


client.on('guildMemberAdd', async (member) => {

    if (db.get(`blacklist.${member.id}`)) {

        member.guild.members.ban(member.id, { reason: `Blacklist` })
        member.send({ content: `Vous etes blacklist de **${member.guild.name}** vous ne pouvez pas rejoindre le serveur` })
    }
})