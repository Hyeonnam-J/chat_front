'use strict';

const Chat = require('./chat');

function render(_id, messages, document){
    const viewBox = document.querySelector('#viewBox');

    // 뷰 박스 초기화.
    while(viewBox.firstChild){
        viewBox.removeChild(viewBox.firstChild);
    }

    // 메시지 렌더링.
    messages.forEach(data => {
        const messageBox = document.createElement('div');
        messageBox.className = 'messageBox';

        if(! data.issued && data.infoType === Chat.INFO_TYPE.alarm){
            // 다른 유저의 출입 알림.
            // issued가 참인 경우는 새로운 클라이언트가 접속했을 때, clients 배열이 아닌 서버가 접속한 소켓을 통해 전달하기 때문에 당사자에게만 온다.
            // 퇴장 시 알림은 clients 배열에서 당사자를 먼저 삭제 후 전송.
            // 그래서 issued가 거짓이고, infoType이 alarm 경우는 무조건 다른 유저의 출입 알림.
            const serverAlarm = document.createElement('div');
            serverAlarm.className = 'serverAlarm';
            serverAlarm.innerText = data.message;

            messageBox.appendChild(serverAlarm);
        }else{
            const profile = document.createElement('div');
            profile.className = 'profile';
            profile.innerText = data.id;

            const message = document.createElement('div');
            message.className = 'message';
            message.innerText = data.message;
            
            if(_id === data.id){   // 내가 보낸 메시지
                messageBox.appendChild(message);
                messageBox.appendChild(profile);
                messageBox.classList.add('flex-end');
            }else{                  // 남이 보낸 메시지
                messageBox.appendChild(profile);
                messageBox.appendChild(message);
                messageBox.classList.add('flex-start');
            }
        }

        viewBox.appendChild(messageBox);
    });
}

module.exports = { render };