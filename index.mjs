import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';

dotenv.config();

const botClient = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
]});

botClient.on(Events.MessageCreate, (message) => {
    let announement_type = null;
    switch (message.channelId){
        case "1171348411589607434": //#resonite-announcements
            announement_type = "announcement";
            break;
        case "1171348449367687239": //#resonite-updates
            announement_type = "update"
            break;
        case "1171348477201088532": //#resonite-devlog
            announement_type = "devlog";
            break;
        default:
            break;
    }

    //Do some things here
    if (typeof announement_type === "string"){
        fetch("https://social.lexevo.net/api/v1/statuses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.FEDI_TOKEN}`,
                "Content-Type": "application/json"
            }
        });
    }
    
});

botClient.login(process.env.DISCORD_TOKEN);