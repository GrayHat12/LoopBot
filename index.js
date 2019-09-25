const { Client, RichEmbed, Attachment } = require('discord.js');
const os = require('os');
const querystring = require('querystring');
const request = require('request');
const unirest = require('unirest');
const News=require('./news.js');
const UserHandler=require('./userHandling.js');
const Weather=require('./weather.js');


//const auth = require('./config.json');
const acronyms = require('./country.json');
const langCode = require('./language.json');

const dev_id = '625267795613188130';
const support_id = '625002905354895380';
const loopServer = '624992843064410122';
const welcomeChannelId = '625018923158601758';
const PREFIX = '.';
const client = new Client();

var welcomeChannel;
var MEMES = [];
var lastRun = 0;

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

async function gprofile(message) {
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
                    .addField('NAME', memberdata[i].user.username, true)
                    .addField('DISCRIMINATOR', memberdata[i].user.discriminator, true)
                    .addField('BOT', memberdata[i].user.bot, true)
                    .addField('LAST MESSAGE', memberdata[i].user.lastMessage.content, true)
                    .addField('ROLES', rols.join(' , '), true)
                    .addField('JOINED AT', memberdata[i].joinedAt, true)
                    .addField('STATUS', memberdata[i].presence.status, true)
                    .addField('ACCOUNT CREATED', clusr[0].createdAt, true)
                    .addField('IS VERIFIED', clusr[0].verified, true)
                    .setTimestamp(new Date())
                message.channel.send(embd);
            }
            catch (e) {
                var embd = new RichEmbed()
                    .setTitle(memberdata[i].user.username)
                    .setColor(0x636369)
                    .setThumbnail(memberdata[i].user.avatarURL)
                    .setAuthor(message.author.username)
                    .addField('NAME', memberdata[i].user.username, true)
                    .addField('DISCRIMINATOR', memberdata[i].user.discriminator, true)
                    .addField('BOT', memberdata[i].user.bot, true)
                    .addField('ROLES', rols.join(' , '), true)
                    .addField('JOINED AT', memberdata[i].joinedAt, true)
                    .addField('STATUS', memberdata[i].presence.status, true)
                    .addField('ACCOUNT CREATED', clusr[0].createdAt, true)
                    .addField('IS VERIFIED', clusr[0].verified, true)
                    .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                    .setTimestamp(new Date())
                message.channel.send(embd);
            }
        }
    }
}

async function ghelp(message) {
    var embed = new RichEmbed()
        .setTitle('LOOP BOT HELP')
        .setColor(0x636369)
        .setThumbnail(client.user.avatarURL)
        .setAuthor(message.author.username)
        .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
        .setTimestamp(new Date())
        .setDescription("PREFIX : " + PREFIX)
        .addField('eval', 'Evaluate command', true)
        .addField('sys', 'Shows system information', true)
        .addField('translate', 'Google Translate (Syntax : `translate toLangCode textToTranslate`)', true)
        .addField('define', 'Urban Dictionary api (Syntax : `define word`)', true)
        .addField('cconvert', 'Currency Converter (Syntax : `cconvert fromCurrencyCode toCurrencyCode Quantity`)', true)
        .addField('currency', 'Crypto Currency Details (Syntax : `currency CryptoCurrencyCode`)', true)
        .addField('country', 'Shows Country Details (Syntax : `country CountryNameOrCode`)', true)
        .addField('servers', 'List of Servers the Bot Operates on', true)
        .addField('profile', 'Shows Profile of tagged member')
    message.channel.send(embed);
}

async function getMemesGaming(message) {
    var url = "https://www.gamedesigning.org/video-game-memes/";
    request(url, async function (err, res, body) {
        if (err) {
            console.log(err);
            customSend(logChannel, err);
            return;
        }
        var data = "" + body;
        while (data.includes(" srcset")) {
            data = data.substring(data.indexOf(" srcset=\"") + " srcset=\"".length);
            var tmp = data.substring(0, data.indexOf(' '));
            if (MEMES.includes(tmp)) {
                ;
            }
            else {
                MEMES.push(tmp);
            }
        }
        await getMemesReddit(message);
    });
}

async function getMemesReddit(message) {
    var url = "https://www.reddit.com/r/gamingmemes/";
    return request(url, async function (err, res, body) {
        if (err) {
            console.log(err);
            return;
        }
        var data = "" + body;
        while (data.includes("https://preview.redd.it/")) {
            data = data.substring(data.indexOf("https://preview.redd.it/") + "https://preview.redd.it/".length);
            var tmp = "https://preview.redd.it/" + data.substring(0, 17);
            if (MEMES.includes(tmp)) {
                ;
            }
            else {
                MEMES.push(tmp);
            }
        }
        await getMemesDevlp(message);
    });
}

async function getMemesDevlp(message) {
    var url = "http://devhumor.com/";
    return request(url, async function (err, res, body) {
        if (err) {
            console.log(err);
            customSend(logChannel, err);
            return;
        }
        var data = "" + body;
        var mn = "http://devhumor.com";
        while (data.includes("/content/uploads/images/")) {
            data = data.substring(data.indexOf("/content/uploads/images/"));
            var tmp = data.substring(0, data.indexOf(".") + 4);
            if (!MEMES.includes(mn + tmp)) {
                MEMES.push(mn + tmp);
            }
            data = data.substring(tmp.length);
        }
        await getMemesDroid(message);
    });
}

async function getMemesDroid(message) {
    var url = "https://www.memedroid.com/memes/tag/programming";
    return request(url, async function (err, res, body) {
        if (err) {
            console.log(err);
            customSend(logChannel, err);
            return;
        }
        var data = "" + body;
        data = data.substring(data.indexOf("div class=\"header-item-info green-3\""));
        while (data.includes(".png")) {
            data = data.substring(data.indexOf("\"https:") + 1);
            var tmp = data.substring(0, data.indexOf("\""));
            if (tmp.endsWith(".png") || tmp.endsWith(".jpg") || tmp.endsWith(".jpeg") || tmp.endsWith(".gif")) {
                if (!MEMES.includes(tmp)) {
                    MEMES.push(tmp);
                }
            }
            data = data.substring(tmp.length);
        }
        var rndm = Math.floor(Math.random() * MEMES.length);
        console.log(MEMES[rndm]);
        var embd = new RichEmbed()
            .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
            .setColor(0x636369)
            .setImage(''+MEMES[rndm])
            .setTitle("RANDOM MEME")
            .setTimestamp(new Date());
        await message.channel.send(embd);
    });
}

function compiler(message, lang, source, input) {
    var options = {
        method: 'POST',
        url: 'https://www.codechef.com/api/ide/run/all',
        headers: {
            Origin: 'https://www.codechef.com',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'referer': 'https://www.codechef.com/ide',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
        },
        form:
        {
            sourceCode: source,
            language: langCode.support['' + lang.toLowerCase()],
            input: input
        }
    };
    //console.log(options);
    request(options, function (error, response, body) {
        if (error) {
            message.channel.send(error, { code: "x1" });
            return;
        }
        var done = false;
        try {
            var resp = JSON.parse(body);
            var timestamp = resp.timestamp;
            var codeCompile;
            function FetchCode() {
                if (done == true) {
                    return;
                }
                var Noptions = {
                    method: 'GET',
                    url: 'https://cors-anywhere.herokuapp.com/https://www.codechef.com/api/ide/run/all',
                    headers: {
                        'Origin': 'https://www.codechef.com',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
                    },
                    qs: { timestamp: timestamp }
                }
                request(Noptions, (errorr, responses, bodyy) => {
                    if (errorr) { message.channel.send(errorr, { code: "x1" }); return; }
                    var respp = JSON.parse(bodyy);
                    var status = respp.status;
                    var codestatus = respp.code_status;
                    if (codestatus == "0" && status == "OK") {
                        done = true;
                        clearInterval(codeCompile);
                        var meta = {
                            time: respp.time,
                            memory: parseFloat("" + respp.memory) / 1000,
                            output: respp.output,
                            stderr: respp.stderr,
                            cmpinfo: respp.cmpinfo
                        };
                        var outPut = "";
                        if (meta.cmpinfo != "") {
                            outPut = "Compile Time Error : " + meta.cmpinfo + "\n\n";
                        }
                        if (meta.stderr != "") {
                            outPut += "Run Time Error : " + meta.stderr + "\n\n";
                        }
                        var help = "";
                        help += "TIME TAKEN : " + meta.time + " sec , ";
                        help += "MEMORY USED : " + meta.memory + " kB \n";
                        outPut += meta.output;
                        var embed = new RichEmbed()
                            .setTitle(lang.toUpperCase())
                            .setColor(0x636369)
                            .setThumbnail(client.user.avatarURL)
                            .setAuthor(message.author.username)
                            .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL)
                            .setTimestamp(new Date())
                            .addField('COMPILER MESSAGE', help, false)
                            .addField('OUTPUT', outPut, false);
                        message.channel.send(embed);
                    }
                });
            }
            codeCompile = setInterval(FetchCode, 3000);
        }
        catch (err) {
            message.channel.send("Response Body : \n" + body + "\nError : " + err, { code: 'x1' });
        }
    });
}

client.on('message', async function (message) {
    if (message.author.bot || !message.content.startsWith(PREFIX) || !message.guild) {
        return;
    }
    try {
        const roles = [];
        message.member.roles.forEach(role => {
            roles.push(role.id)
        });
        //ping
        if (message.content === PREFIX + 'ping') {
            message.channel.send('pong');
        }
        //eval
        else if (message.content.startsWith(PREFIX + 'eval')) {
            if (roles.includes(dev_id)) {
                message.react('👍');
                await geval(message);
            }
            else {
                message.react('👎');
                message.channel.send(`ERROR : ${message.author.username} does not have permission to use this command`, { code: "x1" });
            }
        }
        //system info
        else if (message.content.toLowerCase().trim() == PREFIX + 'sys') {
            if (roles.includes(dev_id) || roles.includes(support_id)) {
                message.react('👍');
                await gsys(message);
            }
            else {
                message.react('👎');
                message.channel.send(`ERROR : ${message.author.username} not authorized for this command.`, { code: "xl" });
            }
        }
        //google translate
        else if (message.content.startsWith(PREFIX + 'translate')) {
            message.react('👍');
            await gtranslate(message);
        }
        //word definition
        else if (message.content.startsWith(PREFIX + 'define')) {
            message.react('👍');
            await gdefine(message, message.content.split(' ')[1]);
        }
        //currency converter
        else if (message.content.startsWith(PREFIX + 'cconvert')) {
            message.react('👍');
            await gcurrencyConverter(message, message.content.split(' ')[1], message.content.split(' ')[2], message.content.split(' ')[3]);
        }
        //crypto currency info
        else if (message.content.startsWith(PREFIX + 'currency')) {
            message.react('👍');
            await gcurrencyInfo(message, message.content.split(' ')[1]);
        }
        //country details
        else if (message.content.startsWith(PREFIX + 'country')) {
            message.react('👍');
            await gcontryDetails(message, message.content.split(' ')[1]);
        }
        //list servers
        else if (message.content == PREFIX + 'servers') {
            if (roles.includes(dev_id) || roles.includes(support_id)) {
                message.react('👍');
                await gservers(message);
            }
            else {
                message.react('👎');
                message.channel.send(`ERROR : ${message.author.username} not authorized for this command.`, { code: "xl" });
            }
        }
        //user profile
        else if (message.content.toLowerCase().startsWith(PREFIX + 'profile')) {
            message.react('👍');
            await gprofile(message);
        }
        //help
        else if (message.content.toLowerCase() == PREFIX + 'help') {
            message.react('👍');
            await ghelp(message);
        }
        else if (message.content.toLowerCase() == PREFIX + 'meme') {
            message.react('👍');
            await getMemesGaming(message);
        }
        else if(message.content.toLowerCase().indexOf(PREFIX+'news')>=0)
        {
            News.PostArticle(message,undefined);

        }
        else if(message.content.toLowerCase().indexOf(PREFIX+'weather')>=0)
        {
            Weather.GetWeatherInfo(message);

        }
        else if(message.content.toLowerCase().indexOf(PREFIX+'warn')>=0)
        {
            UserHandler.Warn(message);
        }

        else if (message.content.toLowerCase().startsWith(PREFIX + "compile")) {
            if (Date.now() < lastRun + 5000) {
                message.react('👎');
                message.channel.send('Compiler busy... Needs 5 seconds after every run');
            }
            else {
                message.react('👍');
                var mess = message.content.split(' ');
                mess.shift();
                var lang = mess.shift();
                var codee = mess.join(' ').split('code:');
                var input = codee.shift();
                var code = codee.join('code:');
                console.log(lang, code, input);
                var embd = new RichEmbed()
                    .setTitle('Detected Input')
                    .addField('Language', lang.toUpperCase(), false)
                    .addField('Code', code, false)
                    .addField('Input', input, false)
                    .setFooter('Brought to you by Loop Bot © Galgotias', client.user.avatarURL);
                message.channel.send(embd);
                await compiler(message, lang, code, input);
                lastRun = Date.now();
            }
        }
    }
    catch (err) {
        console.log(err);
        message.channel.send(err);
    }
});

client.login(process.env.TOKEN);
