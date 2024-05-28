'user strict';

const fs = require('fs');

function getServerInfo() {
    return new Promise((resolve, reject) => {
        // 호스트, 포트 정보 가져오기.
        const filePath = '/home/hn/project/chat_etc/server.txt';
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.log('에러: ', err);
                reject(err);
            } else {
                console.log('서버 정보: ', data);

                const seperator = data.indexOf('/');
                const strHost = data.substring(0, seperator).trim();
                const strPort = data.substring(seperator + 1).trim();

                const hostSeperator = strHost.indexOf(':');
                const portSeperator = strPort.indexOf(':');
                const _host = strHost.substring(hostSeperator + 1).trim();
                const _port = strPort.substring(portSeperator + 1).trim();

                resolve({ host: _host.toString(), port: parseInt(_port) });
            }
        });
    });
}

module.exports = { getServerInfo };