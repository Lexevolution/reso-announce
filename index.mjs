import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits } from 'discord.js';

dotenv.config();

//An in-memory map to keep track of which discord message links to which fedi post.
//Used to find which fedi post to reply to when discord message is edited.
let posts = new Map();

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
            announcement_type = "update";
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

                if (res2.status === 200){
                    const resJson = await res2.json();
                    attachment_ids.push(resJson.id);
                }

            }

        }
        //TODO: Check for rapid succession of messages
        
        const bodyBuilder = {
            "status": `Resonite ${announcement_type} post: ${message.content}\n\n#resonite`,
            "media_ids": attachment_ids,
            "visibility": "public"
        };

        const res = await fetch("https://social.lexevo.net/api/v1/statuses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.FEDI_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyBuilder)
        });
        const resBody = await res.json();

        posts.set(message.id, resBody.id);
    }
    
});

botClient.on("messageUpdate", async (oldMessage, newMessage) => {
    let announcement_type = null;
    //Check to see if message was edited
    switch (newMessage.channelId){
        case "1171348411589607434": //#resonite-announcements
            announcement_type = "announcement";
            break;
        case "1171348449367687239": //#resonite-updates
            announcement_type = "update";
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

    const bodyBuilder = {
        "status": `Edited resonite ${announcement_type} post: ${newMessage.content}`,
        "in_reply_to_id": posts.get(oldMessage.id),
        "visibility": "unlisted"
    };

    const res = await fetch("https://social.lexevo.net/api/v1/statuses", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.FEDI_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyBuilder)
    });
    const resBody = await res.json();

    posts.set(newMessage.id, resBody.id);
});

botClient.login(process.env.DISCORD_TOKEN);