const { Client, RichEmbed, Attachment } = require('discord.js');
const os = require('os');
const querystring = require('querystring');
const request = require('request');
const unirest = require('unirest');

const auth = require('./config.json');
const acronyms = require('./country.json');

const dev_id = ['425182298280034305', '581373579099242496'];
const loopServer = '624992843064410122';
const welcomeChannelId = '625018923158601758';
const PREFIX = '.cmd-';
const client = new Client();
const tmurl = "https://play.google.com/store/apps/category/GAME/collection/topgrossing";

var welcomeChannel;

function filter(body) {
    var arr = [];
    var tmp = '';
    var start = false;
    for (var i = 0; i < body.length; i++) {
        //process.stdout.write("\r"+"I : "+i);
        if (i + identgs.length < body.length && !start) {
            if (body.substring(i, i + identgs.length) == identgs) {
                start = true;
                continue;
            }
        }
        else if (start) {
            if (body.charAt(i) == ">") {
                arr.push(getTitel(tmp));
                tmp = '';
                start = false;
                continue;
            }
        }
        if (start) {
            tmp += body.charAt(i);
        }
    }
    return arr;
}

function getTags(mess) {
	var out = [];
	var strt = false;
	var tmp = '';
	for (var i = 0; i < mess.length; i++) {
		if (!strt && mess.substring(i, i + 2) == '<@') {
			strt = true;
			i += 1;
			continue;
		}
		if (strt && mess.charAt(i) == '>') {
			strt = false;
			out.push(tmp);
			tmp = '';
			continue;
		}
		if (strt) {
			tmp += mess.charAt(i);
		}
	}
	return out;
}

client.on('guildMemberAdd', (member) => {
    //console.log(member);
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
    welcomeChannel = client.guilds.get(loopServer).channels.get(welcomeChannelId);
});

function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

async function geval(message) {
    var mess = message.content;
    var args = mess.split(" ").slice(1);
    try {
        const code = args.join(" ");
        let evaled = await eval(code);
        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);
        var out = '' + clean(evaled);
        while (out.length > 1900) {
            await message.channel.send(out.substring(0, 1900), { code: "xl" });
            out = out.substring(1900);
        }
        await message.channel.send(out, { code: "xl" });
    } catch (err) {
        console.log(err);
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
    return;
}

async function gsys(message) {
    var embd = new RichEmbed().setAuthor(message.author.username).setThumbnail(client.user.avatarURL).setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL).setTitle('SYSTEM INFORMATION').setDescription('ARCHITECTURE : `' + os.arch() + '`\nCPUS : `' + os.cpus().length + '`\nMODEL : `' + os.cpus()[0].model + '`\nSPEED : `' + os.cpus()[0].speed + '`\nFREE MEMORY : `' + os.freemem() + '`\nTOTAL MEMORY : `' + os.totalmem() + '`\nPLATFORM : `' + os.platform() + '`\nRELEASE : `' + os.release() + '`\nTYPE : `' + os.type() + '`\nUPTIME : ' + os.uptime());
    message.channel.send(embd);
    return;
}

async function gtranslate(message) {
    var src = message.content.split(' ')[1];
    var text = message.content.replace('g+translate', '');
    text = text.substring(4);
    text = querystring.escape(text);
    //console.log('src=', src);
    //console.log('txt=', text);
    var options = {
        method: 'GET',
        uri: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + src + '&q=' + text + '&dt=t&Content-Type=application/json',
        gzip: true
    };
    request(options, function (err, res, body) {
        //console.log('We\'re here');
        if (err) {
            //console.log(err);
            message.channel.send(err, { code: 'x1' });
            return;
        }
        //console.log(body);
        var tmpdat = JSON.parse("{ \"data\":" + body + "}");
        var out = tmpdat.data[0][0][0];
        //console.log("OUTPUT : \n", out);
        message.channel.send('Translated from ' + tmpdat.data[8][0] + '\nText : ' + out, { code: 'x1' });
    });
}

async function gdefine(message, word) {
    try {
        unirest.get("https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=" + word)
            .header("X-RapidAPI-Host", "mashape-community-urban-dictionary.p.rapidapi.com")
            .header("X-RapidAPI-Key", "0093e6720amsh520bdcbe1266906p136b38jsnb67ca455ba6f")
            .end(function (result) {
                try {
                    //console.log(result.status, result.headers, result.body);
                    var dat = JSON.parse("" + JSON.stringify(result.body));
                    var means = dat.list[0];
                    var define = means.definition;
                    var url = means.permalink;
                    var author = means.author;
                    var word = means.word;
                    var example = means.example;
                    var embed = new RichEmbed().setTitle('URBAN DICTIONARY')
                        .setAuthor(author)
                        .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                        .setTimestamp(new Date())
                        .setURL(url)
                        .addField('DEFINITION', define, false)
                        .addField('WORD', word)
                        .addField('EXAMPLE', example);
                    message.channel.send(embed);
                }
                catch (err) {
                    message.channel.send(err, { code: 'x1' });
                }
            });
    }
    catch (err) {
        message.channel.send(err, { code: 'x1' });
    }
}

async function gcurrencyConverter(message, from, to, qty) {
    try {
        unirest.get("https://bravenewcoin-v1.p.rapidapi.com/convert?qty=" + qty + "&from=" + from + "&to=" + to)
            .header("X-RapidAPI-Host", "bravenewcoin-v1.p.rapidapi.com")
            .header("X-RapidAPI-Key", "0093e6720amsh520bdcbe1266906p136b38jsnb67ca455ba6f")
            .end(function (result) {
                //console.log(result.status, result.headers, result.body);
                if (result.status != 200) {
                    return;
                }
                var data = JSON.parse("" + JSON.stringify(result.body));
                if (data.success != true) {
                    message.channel.send(result.body, { code: 'x1' });
                    return;
                }
                var fqty = data.from_quantity;
                var fromid = data.from_symbol;
                var fromName = data.from_name;
                var toid = data.to_symbol;
                var toName = data.to_name;
                var tqty = data.to_quantity;
                var embd = new RichEmbed()
                    .setTitle(fromName + ' to ' + toName + ' Converter')
                    .setAuthor(message.author.username)
                    .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                    .setTimestamp(new Date())
                    .setDescription(fqty + ' ' + fromid + ' = ' + tqty + ' ' + toid);
                message.channel.send(embd);
                return;
            });
    }
    catch (err) {
        message.channel.send(err, { code: 'x1' });
    }
}

async function gcurrencyInfo(message, currency) {
    try {
        unirest.get("https://bravenewcoin-v1.p.rapidapi.com/ticker?show=usd&coin=" + currency)
            .header("X-RapidAPI-Host", "bravenewcoin-v1.p.rapidapi.com")
            .header("X-RapidAPI-Key", "0093e6720amsh520bdcbe1266906p136b38jsnb67ca455ba6f")
            .end(function (result) {
                //console.log(result.status, result.headers, result.body);
                if (result.status != 200) {
                    return;
                }
                var data = JSON.parse("" + JSON.stringify(result.body));
                if (data.success != true) {
                    message.channel.send(result.body, { code: 'x1' });
                    return;
                }
                var name = data.coin_name;
                var id = data.coin_id;
                var price = '1 ' + id + ' = ' + data.last_price + ' USD';
                var price24hrprcnt = data.price_24hr_pcnt;
                var vol24hrprcnt = data.vol_24hr_pcnt;
                var vol24hr = data.volume_24hr;
                var embed = new RichEmbed()
                    .setTitle(name + ' (' + id + ')')
                    .setAuthor(message.author.username)
                    .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                    .setTimestamp(new Date())
                    .addField('PRICE', ' ' + price, false)
                    .addField('PRICE 24-HR PERCENT', ' ' + price24hrprcnt + '%', false)
                    .addField('VOLUME 24-HR', ' ' + vol24hr, false)
                    .addField('VOLUME 24-HR %', ' ' + vol24hrprcnt + '%', false);
                message.channel.send(embed);
                return;
            });
    }
    catch (err) {
        message.channel.send(err, { code: 'x1' });
    }
}

async function gcontryDetails(message, ccode) {
    if (ccode.length > 3) {
        ccode = acronyms[ccode.split(' ').join('').split('.').join('').split('&').join('').toLowerCase()];
        console.log(ccode);
    }
    try {
        unirest.get("https://restcountries-v1.p.rapidapi.com/alpha/" + ccode)
            .header("X-RapidAPI-Host", "restcountries-v1.p.rapidapi.com")
            .header("X-RapidAPI-Key", "0093e6720amsh520bdcbe1266906p136b38jsnb67ca455ba6f")
            .end(function (result) {
                //console.log(result.status, result.headers, result.body);
                if (result.status != 200) {
                    return;
                }
                //message.channel.send(JSON.stringify(result.body),{code:"xl"});
                var data = JSON.parse("" + JSON.stringify(result.body));
                var name = data.name;
                var topLevelDomain = data.topLevelDomain;
                var tld = '';
                for (var i = 0; i < topLevelDomain.length; i++) {
                    tld += topLevelDomain[i] + ' ';
                }
                var alpha2Code = data.alpha2Code;
                var alpha3Code = data.alpha3Code;
                var callingCodes = data.callingCodes;
                var cc = '';
                for (var i = 0; i < callingCodes.length; i++) {
                    cc += callingCodes[i] + ' ';
                }
                var capital = data.capital;
                var altSpellings = data.altSpellings;
                var as = '';
                for (var i = 0; i < altSpellings.length; i++) {
                    as += altSpellings[i] + ' ';
                }
                var region = data.region;
                var subregion = data.subregion;
                var population = data.population;
                var latlng = data.latlng;
                var laln = '' + latlng[0] + ' : ' + latlng[1];
                var demonym = data.demonym;
                var area = data.area;
                var gini = data.gini;
                var timezones = data.timezones;
                var tz = '';
                for (var i = 0; i < timezones.length; i++) {
                    tz += timezones[i] + ' ';
                }
                var borders = data.borders;
                var bdr = borders.join(' ,');
                var nativeName = data.nativeName;
                var numericCode = data.numericCode;
                var currencies = data.currencies;
                var crncy = currencies.join(' ,');
                var languages = data.languages;
                var lang = languages.join(' ,');
                var translations = JSON.parse("" + JSON.stringify(data.translations));
                var trans = "DE : " + translations.de + '\n' + "ES : " + translations.es + '\n' + "FR : " + translations.fr + '\n' + "JA : " + translations.ja + '\n' + "IT : " + translations.it;
                var relevance = data.relevance;
                var embd = new RichEmbed()
                    .setTitle(name)
                    .setAuthor(message.author.username)
                    .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                    .setTimestamp(new Date())
                    .addField('TOP LEVEL DOMAIN', "> " + tld, false)
                    .addField('2 ALPHABET CODE', "> " + alpha2Code, false)
                    .addField('3 ALPHABET CODE', "> " + alpha3Code, false)
                    .addField('CALLING CODES', "> " + cc, false)
                    .addField('CAPITAL', "> " + capital, false)
                    .addField('ALTERNATE SPELLINGS', "> " + as, false)
                    .addField('REGION', "> " + region, false)
                    .addField('SUBREGION', "> " + subregion, false)
                    .addField('POPULATION', "> " + population + ' people', false)
                    .addField('LATITUDE : LONGITUDE', "> " + laln, false)
                    .addField('DENONYM', "> " + demonym, false)
                    .addField('AREA', "> " + area + ' km sq.', false)
                    .addField('GINI COEFFICIENT', "> " + gini, false)
                    .addField('TIMEZONES', "> " + tz, false)
                    .addField('NEIGHBOURS', "> " + bdr, false)
                    .addField('NATIVE NAME', "> " + nativeName, false)
                    .addField('NUMERIC CODE', "> " + numericCode, false)
                    .addField('CURRENCIES', "> " + crncy, false)
                    .addField('MAJOR LANGUAGES', "> " + lang, false)
                    .addField('TRANSLATIONS', "> " + trans, false)
                    .addField('RELEVANCE', "> " + relevance, false);
                message.channel.send(embd);
            });
    }
    catch (err) {
        message.channel.send(err, { code: 'x1' });
    }
}

async function gservers(message) {
    var guilds = client.guilds.array();
    var data = "";
    for (var i = 0; i < guilds.length; i++) {
        data += guilds[i].name + " : " + guilds[i].id + "\n";
    }
    message.channel.send("```ARM\n" + data + "```");
}

async function gplaygames(message) {
    var out = '';
    var tmb = '';
    request(tmurl, function (err, res, body) {
        if (err) {
            console.log(err, "error occured while hitting URL");
        }
        else {
            var arr = filter(body);
            for (var i = 0; i < arr.length && i < 5; i++) {
                var img = getImag(arr[i], body);
                out += arr[i].replace('&amp;', '&') + "\n" + "Image :- " + img + "\n";
            }
            tmb = getImag(arr[0], body);
            var embd = new RichEmbed().setTitle('TOP GAMES FROM PLAYSTORE').setColor(0x636369).setDescription(out).setAuthor(message.author.username, message.author.avatarURL).setThumbnail(tmb);
            message.reply(embd);
        }
    });
}

async function gprofile(message)
{
    var tags = getTags(message.content);
	var memberdata = [];
	message.guild.members.forEach(user => memberdata.push(user));
	for (var i = 0; i < memberdata.length; i++) {
		if (tags.includes(memberdata[i].id)) {
			var clusr = [];
			client.users.forEach(function (user) {
				if (user.id == memberdata[i].id) {
					clusr.push(user);
					return;
				}
			});
			var rols = [];
			memberdata[i].roles.forEach(roles => rols.push(roles));
			try {
                var embd = new RichEmbed()
                .setTitle(memberdata[i].user.username)
                .setColor(0x636369)
                .setThumbnail(memberdata[i].user.avatarURL)
                .setAuthor(message.author.username)
                .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                .addField('NAME',memberdata[i].user.username,true)
                .addField('DISCRIMINATOR',memberdata[i].user.discriminator,true)
                .addField('BOT',memberdata[i].user.bot,true)
                .addField('LAST MESSAGE',memberdata[i].user.lastMessage.content,true)
                .addField('ROLES',rols.join(','),true)
                .addField('JOINED AT',memberdata[i].joinedAt,true)
                .addField('STATUS',memberdata[i].presence.status,true)
                .addField('ACCOUNT CREATED',clusr[0].createdAt,true)
                .addField('IS VERIFIED',clusr[0].verified,true)
                .setTimestamp(new Date())
				message.channel.send(embd);
			}
			catch (e) {
                var embd = new RichEmbed()
                .setTitle(memberdata[i].user.username)
                .setColor(0x636369)
                .setThumbnail(memberdata[i].user.avatarURL)
                .setAuthor(message.author.username)
                .addField('NAME',memberdata[i].user.username,true)
                .addField('DISCRIMINATOR',memberdata[i].user.discriminator,true)
                .addField('BOT',memberdata[i].user.bot,true)
                .addField('ROLES',rols.join(','),true)
                .addField('JOINED AT',memberdata[i].joinedAt,true)
                .addField('STATUS',memberdata[i].presence.status,true)
                .addField('ACCOUNT CREATED',clusr[0].createdAt,true)
                .addField('IS VERIFIED',clusr[0].verified,true)
                .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                .setTimestamp(new Date())
				message.channel.send(embd);
			}
		}
	}
}

client.on('message', async function (message) {
    if (message.author.bot || !message.content.startsWith('cmd')) {
        return;
    }
    try {
        //ping
        if (message.content === PREFIX+'ping') {
            message.reply('pong');
        }
        //eval
        else if (message.content.startsWith(PREFIX+'eval') && dev_id.includes(message.author.id)) {
            message.react('👍');
            await geval(message);
        }
        //system info
        else if (message.content.toLowerCase().trim() == PREFIX+'sys' && dev_id.includes(message.author.id)) {
            message.react('👍');
            await gsys(message);
        }
        //google translate
        else if (message.content.startsWith(PREFIX+'translate')) {
            message.react('👍');
            await gtranslate(message);
        }
        //word definition
        else if (message.content.startsWith(PREFIX+'define')) {
            message.react('👍');
            await gdefine(message, message.content.split(' ')[1]);
        }
        //currency converter
        else if (message.content.startsWith(PREFIX+'cconvert')) {
            message.react('👍');
            await gcurrencyConverter(message, message.content.split(' ')[1], message.content.split(' ')[2], message.content.split(' ')[3]);
        }
        //crypto currency info
        else if (message.content.startsWith(PREFIX+'currency')) {
            message.react('👍');
            await gcurrencyInfo(message, message.content.split(' ')[1]);
        }
        //country details
        else if (message.content.startsWith(PREFIX+'country')) {
            message.react('👍');
            await gcontryDetails(message, message.content.split(' ')[1]);
        }
        //list servers
        else if (message.content == PREFIX+'servers') {
            if (dev_id.includes(message.author.id)) {
                message.react('👍');
                await gservers(message);
            }
            else {
                message.channel.send(`ERROR : ${message.author.username} not authorized for this command.`, { code: "xl" });
            }
        }
        //top games list from playstore
        else if (message.content.toLowerCase() == PREFIX+'topgames') {
            message.react('👍');
            await gplaygames(message);
        }
        //user profile
        else if (message.content.toLowerCase().startsWith(PREFIX+'profile ')) {
            message.react('👍');
            await gprofile(message);
		}
    }
    catch (err) {
        console.log(err);
        message.channel.send(err);
    }
});

client.login(auth.TOKEN);