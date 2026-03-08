const express = require("express")
const axios = require("axios")
const NodeCache = require("node-cache")
const cors = require("cors")
const morgan = require("morgan")

const app = express()

// =============================
// CONFIG
// =============================

const PORT = 3000
const cache = new NodeCache({ stdTTL: 600 })

// region server FF
const REGIONS = {
  vn: "https://clientbp.ggblueshark.com/GetPlayerPersonalShow",
  sg: "https://clientbp.ggblueshark.com/GetPlayerPersonalShow",
  ind: "https://clientind.ggblueshark.com/GetPlayerPersonalShow",
  br: "https://clientbr.ggblueshark.com/GetPlayerPersonalShow"
}

// =============================
// MIDDLEWARE
// =============================

app.use(cors())
app.use(morgan("dev"))

// =============================
// HOME
// =============================

app.get("/", (req, res) => {
  res.json({
    name: "Free Fire UID API",
    status: "running",
    endpoint: "/api/ffinfo?uid=UID&region=vn"
  })
})

// =============================
// API CHECK UID
// =============================

app.get("/api/ffinfo", async (req, res) => {

  const uid = req.query.uid
  const region = req.query.region || "vn"

  if (!uid) {
    return res.json({
      status: false,
      message: "Missing UID"
    })
  }

  const cacheKey = `${uid}_${region}`
  const cached = cache.get(cacheKey)

  if (cached) {
    return res.json({
      source: "cache",
      data: cached
    })
  }

  try {

    const url = REGIONS[region]

    const response = await axios.post(url, {
      uid: uid
    })

    const data = response.data

    const result = {
      uid: uid,
      nickname: data?.nickname || "Unknown",
      level: data?.level || 0,
      likes: data?.likes || 0,
      rank: data?.rank || "Unknown",
      guild: data?.guild || "None"
    }

    cache.set(cacheKey, result)

    res.json({
      source: "live",
      data: result
    })

  } catch (err) {

    res.json({
      status: false,
      error: "UID not found or server error"
    })

  }

})

// =============================
// START SERVER
// =============================

app.listen(PORT, () => {
  console.log(`FF API running on port ${PORT}`)
})
