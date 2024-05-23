const { ipcRenderer } = window;

// 서버 정보
const PORT = 3000;
const HOST = '127.0.0.1';

const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', () => {

    console.log('버튼 눌림');

})
