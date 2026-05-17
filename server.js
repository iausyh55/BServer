const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const wss = new WebSocket.Server({
    server
})

const connectedPlayers = new Map()

function broadcastPlayers() {
    const payload = JSON.stringify({
        type: "players",
        players: [...connectedPlayers.values()]
    })

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload)
        }
    })
}

app.get("/", (req, res) => {
    res.send("Server online")
})

app.post("/playerJoin", (req, res) => {
    const player = req.body

    connectedPlayers.set(player.userId, player)

    console.log(player.username + " joined")

    broadcastPlayers()

    res.sendStatus(200)
})

app.post("/playerLeave", (req, res) => {
    connectedPlayers.delete(req.body.userId)

    console.log(req.body.userId + " left")

    broadcastPlayers()

    res.sendStatus(200)
})

wss.on("connection", ws => {
    console.log("Dashboard connected")

    ws.send(JSON.stringify({
        type: "players",
        players: [...connectedPlayers.values()]
    }))
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log("Running on port " + PORT)
})