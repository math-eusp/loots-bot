const _ = require('lodash');
const request = require('request');
const config = require("./config.json");
const fs = require('fs');
const url = `https://loots.com/pub/tip-jars/${config.lootsUser}/status/live`;

rmDir = function(dirPath) {
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
      for (var i = 0; i < files.length; i++) {
        var filePath = dirPath + '/' + files[i];
        if (fs.statSync(filePath).isFile())
          fs.unlinkSync(filePath);
        else
          rmDir(filePath);
      }
  };
createFiles = () => {
    let path = config.path;
    if(path){
        try { var files = fs.readdirSync(path); }    
        catch(e) { 
            console.log('path not found') 
            return false;
        }
    }else{
        path = 'leaderboard';
        try { var files = fs.readdirSync(path); }
        catch(e) { fs.mkdirSync(path); }
    }

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(response.body);
            if(obj.data){
                const tipjar = `https://loots.com/api/v1/aggregates/leaderboards/${obj.data.tipjar.account._id}?json=%7B%7D`
                request(tipjar, function (error, response, html) {
                    if(path === 'leaderboard')
                        rmDir(path);
                    if (!error && response.statusCode == 200) {
                        const obj = JSON.parse(response.body);
                        if(obj.data){
                            if(obj.data[config.type]){
                                let looters = [];
                                const topLoots = obj.data[config.type];
                                let leaderboard = config.top;
                                if(topLoots.length < config.top){
                                    leaderboard = topLoots.length;
                                }
                                for(let i = 0; i < leaderboard; i++){
                                    if(path === 'leaderboard')
                                        path = './leaderboard/'

                                    const topLoot = topLoots[i];
                                    if(config.multiFiles){
                                        const stream = fs.createWriteStream(`${path}/${i+1}.txt`);
                                        stream.once('open', function(fd) {
                                            var strWrite = topLoot.handle_lc;
                                            if(config.showLoots) strWrite += ' - ' + topLoot.total + " Loots";
                                            stream.write(strWrite);
                                            stream.end();
                                        });
                                    }else{
                                        var strWrite = topLoot.handle_lc;
                                        if(config.showLoots) strWrite += ' - ' + topLoot.total + " Loots";
                                        looters.push(strWrite);
                                    }
                                }
                                if(!config.multiFiles){
                                    const stream = fs.createWriteStream(`${path}/${config.lootsUser}.txt`);
                                    stream.once('open', function(fd) {
                                        _.forEach(looters, loot => {
                                            stream.write(`${loot}\r\n`);
                                        })
                                        stream.end();
                                    });
                                }
                                console.log('routine executed')
                            }else{
                                console.log('type not found: ' + config.type);
                            }
                        }
                    }else{
                        console.log(error)
                    }
                })
            }else{
                console.log('user not found: ' + config.lootsUser);
            }
        }else{
            console.log(error)
        }
    })
}

createFiles();
setInterval (() => {
    createFiles()
}, config.updateTime);