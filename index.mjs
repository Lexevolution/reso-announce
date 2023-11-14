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
    let announcement_type = null;
    let attachment_ids = [];
    switch (message.channelId){
        case "1171348411589607434": //#resonite-announcements
            announcement_type = "announcement";
            break;
        case "1171348449367687239": //#resonite-updates
            announcement_type = "update"
            break;
        case "1171348477201088532": //#resonite-devlog
            announcement_type = "devlog";
            break;
        case "1173566951319146536": //#test
            announcement_type = "testing";
            break;
        default:
            break;
    }

    //Do some things here
    if (typeof announcement_type === "string"){
        //Check to see if post has media attachment.
        if (message.attachments){
            for (const attachment of message.attachments.values()){
                console.log(`DISCORD ATTACHMENTS: ${JSON.stringify(attachment)}`);
                let data = new FormData();

                let res = await fetch(attachment.url);
                data.append("file", await res.blob());

                let res2 = await fetch("https://social.lexevo.net/api/v2/media", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.FEDI_TOKEN}`
                    },
                    body: data
                });

                console.log(`UPLOAD ATTEMPT RESULTS: ${JSON.stringify(res2)}`);
                if (res2.status === 200){
                    const resJson = await res2.json();
                    attachment_ids.push(resJson.id);
                }

            }

            console.log("ATTACHMENT IDS: " + JSON.stringify(attachment_ids));
        }
        //Check for rapid succession of messages
        
        const bodyBuilder = {
            "status": `Resonite ${announcement_type} post: ${message.content}\n\n#resonite`,
            "media_ids": attachment_ids,
            "visibility": "private"
        };

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
    let announcement_type = null;
    //Check to see if message was edited
    switch (newMessage.channelId){
        case "1171348411589607434": //#resonite-announcements
            announcement_type = "announcement";
            break;
        case "1171348449367687239": //#resonite-updates
            announcement_type = "update"
            break;
        case "1171348477201088532": //#resonite-devlog
            announcement_type = "devlog";
            break;
        case "1173566951319146536": //#test
            announcement_type = "testing";
            break;
        default:
            break;
    }
})

botClient.login(process.env.DISCORD_TOKEN);