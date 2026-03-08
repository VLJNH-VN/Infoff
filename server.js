const express = require("express")
const axios = require("axios")
const protobuf = require("protobufjs")
const NodeCache = require("node-cache")

const app = express()
const cache = new NodeCache({ stdTTL: 600 })

let PlayerInfo

// load protobuf
protobuf.load("player.proto").then(root => {
  PlayerInfo = root.lookupType("PlayerInfo")
})

async function getPlayerInfo(uid){

  const response = await axios.post(
    "https://clientbp.ggblueshark.com/GetPlayerPersonalShow",
    Buffer.from(uid.toString()),
    {
      responseType: "arraybuffer",
      headers:{
        "User-Agent":"Dalvik/2.1.0 (Linux; Android 10; FreeFire)",
        "Content-Type":"application/octet-stream"
      }
    }
  )

  const decoded = PlayerInfo.decode(new Uint8Array(response.data))

  return {
    uid: decoded.uid,
    nickname: decoded.nickname,
    level: decoded.level,
    likes: decoded.likes,
    rank: decoded.rank,
    guild: decoded.guild
  }

}

app.get("/api/ff", async (req,res)=>{

  const uid = req.query.uid

  if(!uid){
    return res.json({status:false,message:"Missing UID"})
  }

  const cacheData = cache.get(uid)

  if(cacheData){
    return res.json({
      source:"cache",
      data:cacheData
    })
  }

  try{

    const data = await getPlayerInfo(uid)

    cache.set(uid,data)

    res.json({
      source:"live",
      data:data
    })

  }catch(e){

    res.json({
      status:false,
      error:"Decode failed"
    })

  }

})

app.listen(3000,()=>console.log("FF API running"))
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
