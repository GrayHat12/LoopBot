const { Client, RichEmbed, Attachment } = require('discord.js');

const auth = require('./config.json');
const client = new Client();
var welcomeChannel;

client.on('guildMemberAdd', (member) => {
    console.log(member);
    var embed = new RichEmbed()
        .setTitle('WELCOME')
        .setTimestamp(new Date())
        .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
        .setThumbnail(member.user.avatarURL)
        .setDescription("Welcome to the Loop Server of Galgotias " + member.user.username);
    welcomeChannel.send(embed);
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    welcomeChannel = client.guilds.get('624992843064410122').channels.get('625018923158601758');
});

function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

client.on('message', async function (msg) {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
    else if (msg.content.startsWith('g+eval ') && msg.author.id == '425182298280034305') {
        var message = msg.content;
        var args = message.split(" ").slice(1);
        try {
            const code = args.join(" ");
            console.log('STATEMENTv\n', code);
            let evaled = await eval(code);
            console.log('EVALED : \n', evaled);
            if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);
            var out = '' + clean(evaled);
            while (out.length > 1900) {
                await msg.channel.send(out.substring(0, 1900), { code: "xl" });
                out = out.substring(1900);
            }
            await msg.channel.send(out, { code: "xl" });
        } catch (err) {
            console.log(err);
            msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
        return;
    }
});

client.login(auth.TOKEN);