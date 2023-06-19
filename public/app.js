const messagesTypes = { LEFT: 'left', RIGHT: 'right', LOGIN: 'login' };

// Chat Stuff
const chatContainer = document.querySelector('#chat');
const messagesList = document.querySelector('#messagesList');
const messageForm = document.querySelector('#messageForm');
const messagesInput = document.querySelector('#messageInput');
const sendBtn = document.querySelector('#sendBtn');
// Login Stuff
let username = '';
const loginContainer = document.querySelector('#login');
const usernameInput = document.querySelector('#usernameInput');
const loginBtn = document.querySelector('#loginBtn');

let messages = localStorage.getItem('messages') ? JSON.parse(localStorage.getItem('messages')) : []; // { author, date, content, type }
var socket = io();

socket.on('message', (message) => {
    console.log(message);

    if (message.type !== messagesTypes.LOGIN) {
        if (message.author === username) {
            message.type = messagesTypes.RIGHT;
        } else {
            message.type = messagesTypes.LEFT;
        }
    }
    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));
    displayMessages();

    chatContainer.scrollTop = chatContainer.scrollHeight;
})

const createMessageHTML = (message) => {
    if (message.type === messagesTypes.LOGIN) {
        return `
            <p class="secondary-text text-center mb-2">${message.author} has joined the chat...</p>
        `;
        
    }
    return `
        <div class="message ${message.type === messagesTypes.LEFT ? 'message-left' : 'message-right'}">
            <div class="message-details flex">
                <p class="message-author">${message.type === messagesTypes.RIGHT ? '' : message.author}</p>
                <p class="message-date">${message.date}</p>
            </div>
            <p class="message-content">${message.content}</p>
        </div>
    `
}

const displayMessages = () => {
    const messagesHTML = messages
        .map(message => createMessageHTML(message))
        .join('');

    messagesList.innerHTML = messagesHTML;
    // chatContainer.scrollTop = messagesList.scrollHeight
}

displayMessages();


loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!usernameInput.value) return;

    username = usernameInput.value;

    sendMessage({
        author: username,
        date: new Date(),
        type: messagesTypes.LOGIN
    });

    loginContainer.classList.add('hidden');
    messageForm.classList.remove('hidden');
    chatContainer.classList.remove('hidden');
})

sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!messagesInput.value) return;

    const date = new Date();
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const dateString = `${day}/${month}/${year}`;

    const message = {
        author: username,
        date: dateString,
        content: messagesInput.value,
        // type: messagesTypes.RIGHT
    };

    sendMessage(message);

    messagesInput.value = '';
})

const sendMessage = (message) => {
    socket.emit('message', message);
}


const resetStorage = () => {
    if (!messages.length) return;

    const date = messages[0].date;
 
    if (new Date() - new Date(date) >= 604800000) {
        localStorage.clear();
        messages = [];
    }
    // 86400000 - 1day
    // if (new Date().getDay() === 1) {
    //     localStorage.clear();
    //     messages = [];
    // }
}

resetStorage()