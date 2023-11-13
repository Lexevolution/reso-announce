import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';

dotenv.config();

const botClient = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
]});

botClient.on(Events.MessageCreate, async (message) => {
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
        case "1173566951319146536": //#test
            announement_type = "testing";
            break;
        default:
            break;
    }

    //Do some things here
    if (typeof announement_type === "string"){
        //Check to see if post has media attachment.
        console.log(JSON.stringify(message.attachments));
        if (message.attachments){
            for (const attachment of message.attachments.values()){
                let data = new FormData();
                await fetch(attachment.url).then(async (res) => {
                    data.append("file", await res.blob());
                    fetch("https://social.lexevo.net/api/v2/media", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.FEDI_TOKEN}`
                        },
                        body: data
                    }).then((res2) => {
                        if (res2.status === 200){
                            res2.json().then((resJson) => {
                                attachment_ids.push(resJson.id);
                            })
                        }
                    });
                });
            }

            console.log("ATTACHMENT IDS: " + JSON.stringify(attachment_ids));
        }
        //Check for rapid succession of messages
        
        const bodyBuilder = {
            "status": `Resonite ${announement_type} post: ${message.content}\n\n#resonite`,
            "media_ids": attachment_ids,
            "visibility": "private"
        }
        console.log(JSON.stringify(message.author));
        fetch("https://social.lexevo.net/api/v1/statuses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.FEDI_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyBuilder)
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
        case "1173566951319146536": //#test
            announement_type = "testing";
            break;
        default:
            break;
    }
})

botClient.login(process.env.DISCORD_TOKEN);