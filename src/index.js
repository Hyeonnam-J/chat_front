const inputContent = document.getElementById('inputContent');
const sendButton = document.getElementById('sendButton');

sendButton.addEventListener('click', () => {
    alert(inputContent.value);
})