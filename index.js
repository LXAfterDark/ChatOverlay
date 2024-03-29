require('dotenv').config()
const express = require('express')
const fs = require('fs')
const { createServer } = require('https')
const bodyParser = require('body-parser')
const { Server } = require('socket.io')
const { StreamerbotClient } = require('@streamerbot/client')

const main = async () => {
    const app = express()
    const port = Number(process.env.CHATOVERLAY_PORT)

    const httpServer = createServer({
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    }, app)

    const io = new Server(httpServer, { /* options */ })
    const sbClient = new StreamerbotClient({
        host: process.env.STREAMERBOT_WS_IP,
        port: Number(process.env.STREAMERBOT_WS_PORT),
        endpoint: process.env.STREAMERBOT_WS_ENDPOINT,
        autoReconnect: true
    });

    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(express.static('static'))

    io.on('connection', (socket) => {
        console.log('got socket connection from overlay')
        
        socket.on('disconnecting', (reason) => {
            console.log(`socket disconnect: ${reason}`)
        })
    })

    await sbClient.on('Twitch.ChatMessage', (data) => {
        // console.log(JSON.stringify(data.data, null, 4))
        try {
            var chatString = data.data.message.message
            data.data.message.emotes.forEach((emote) => {
                chatString = chatString.replaceAll(emote.name, `<img style="width: 32px; height: 32px;" src="${emote.imageUrl}" />`)
            })

            // TODO: integrate subscriber/moderator/broadcaster badges
            var badges = []
            data.data.message.badges.forEach((badge) => {
                badges.push(`<img style="margin-left: 2px; width: 32px; height: 32px;" src=${badge.imageUrl} />`)
            })

            // TODO: handle cheer emotes

            io.of('/').emit('twitchChatMsg', data.data.message.msgId, badges, data.data.message.displayName, data.data.message.color, chatString)
        } catch (err) {
            console.log(err.message)
            console.debug(err.stack)
        }
    })

    await sbClient.on('Twitch.ChatMessageDeleted', (data) => {
        io.of('/').emit('removeMsg', data.data.targetMessageId)
    })

    await sbClient.on('VStream.ChatMessage', (data) => {
        // console.log(JSON.stringify(data, null, 4))
        try{
            var chatString = data.data.text
            data.data.emojis.forEach((emoji) => {
                chatString = chatString.replaceAll(`:${emoji.name}:`, `<img style="width: 32px; height: 32px;" src="${emoji.imageUrl}" />`)
            })
            io.of('/').emit('vstreamChatMsg', data.data.id, data.data.user.username, data.data.color, chatString)    
        } catch (err) {
            console.log(err.message)
            console.debug(err.stack)
        }
    })

    httpServer.listen(port, () => {
        console.log(`ChatOverlay listening on port ${port}`)
    })

    const shutdownCleanup = () => {
        console.log('App received shutdown signal')
        httpServer.close()
      
        setTimeout(() => { process.exit(0) }, 3000)
    }

    process.on('SIGTERM', shutdownCleanup)
    process.on('SIGINT', shutdownCleanup)
}

main()