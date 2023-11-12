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
    let attachment_ids = [];
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
        //Check to see if post has media attachment.
        if (message.attachments){
            message.attachments.forEach(async attachment => {
                fetch(attachment.url).then((res) => {
                    fetch("https://social.lexevo.net/api/v2/media", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.FEDI_TOKEN}`
                        },
                        body: await res.formData()
                    }).then((res2) => {
                        if (res2.status === 200){
                            res2.json().then((resJson) => {
                                attachment_ids.push(resJson.id);
                            })
                        }
                    });
                });
            });

        }
        //Check for rapid succession of messages
        
        let bodyBuilder = {
            "status": message.
        }
        
        fetch("https://social.lexevo.net/api/v1/statuses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.FEDI_TOKEN}`,
                "Content-Type": "application/json"
            },
            body:
        });
    }
    
});

botClient.on("messageUpdate", (oldMessage, newMessage) => {
    //Check to see if message was edited
    switch (newMessage.channelId){
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
})

botClient.login(process.env.DISCORD_TOKEN);