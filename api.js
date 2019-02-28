const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs')

const name = 'cgu'
var settingsPath = null

var stats = {
  initialized: false,
  status: 'nok',
  validateAction: 'none',
  readed: false
}

function init(app, apiToExpose, persistenceDir) {
  settingsPath = path.join(persistenceDir, name)
  try {
    fs.mkdirSync(settingsPath, { recursive: true })
  } catch(e){}
  settingsPath = path.join(settingsPath, 'settings.json')
  syncStats()

  app.use(apiToExpose, bodyParser.json());
  app.get(apiToExpose, function(req, res){
    syncStats()
    res.json(stats)
  });

  app.post(apiToExpose, function(req, res){
    var data = req.body;
    if(data.readed === "true" || data.readed === true){
      stats.status = 'ok'
      stats.readed = true
      syncStats(true)
      res.json({message: `The Terms was set to accepted.`})
    } else {
      stats.status = 'nok'
      stats.readed = false
      syncStats(true)
      res.status(403).json({message: "The Terms should be accepted", error: "cgu_not_readed"})
    }
  });
}

function syncStats(update){
  if(!settingsPath){
    return
  }
  var statsFromFile
  try {
    statsFromFile = JSON.parse(fs.readFileSync(settingsPath))
    if(update === true){
      stats = Object.assign({}, statsFromFile, stats)
    } else {
      stats = Object.assign({}, stats, statsFromFile)
    }
  } catch(e){
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(stats, null, 4), { encoding: 'utf8'})
    } catch(e){}
  }
  if(stats.initialized === false || update === true){
    stats.initialized = true
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(stats, null, 4), { encoding: 'utf8'})
    } catch(e){}
  }
}

function getStats(){
  return stats
}

module.exports = {
  init: init,
  getStats: getStats,
  syncStats: syncStats,
  order: 10,
  canIgnore: false
}
