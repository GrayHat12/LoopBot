
const  {RichEmbed}  = require('discord.js');
class UserHandling
{
    static Warn(msg)
    {
        let all=msg.content.split(' ');
        let user=all[1];
        let reason=msg.content.substring(8+user.length);
       // user=client.users.find(user.substring(1), sayMessage).toString();

       if(msg.guild.roles.find(role => role.name === "Admin"))
       {
           if(user==null)
           {
           msg.channel.send("lol you want to warn youself Admin");
           return;
           }

        var embd = new RichEmbed()
        .setTitle("Warning")
        .setColor(15158332)
        .addField("To",user,false)
        .addField('Reason:',reason,false);
         msg.channel.send(embd);
       }
       else
       msg.channel.send("I follow my master not his follwers");
       
    }
}

module.exports=UserHandling;