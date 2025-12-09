//let server = new WebSocket("ws://26.59.64.179:8080");
let server = new WebSocket("wss://rosalyn-unparoled-larita.ngrok-free.dev");


server.onopen = () => console.log("подключено");

const answer = document.getElementById("answer");

const FriensContainer = document.getElementById("friends_container_friend");

const msg_input = document.getElementById("message_input");

let messages = {}; 


let friends = [];
let not_accepted_friends = [];

let my_id = 1;

let UserNameAccount = "";

let selectedFriendId = null;



let requests = document.getElementById("requests");
document.getElementById("button_requests").onclick = () => {
    if (requests.style.display === 'block') {
        requests.style.display = 'none';
    } else {
        requests.style.display = 'block';
    }
};

document.getElementById("back_button").onclick = () => {
       document.getElementById("chat").style.display = "none";
       document.getElementById("friends_container").style.display = "flex";
}

function render_chat(friendId) {
    const chatBox = document.getElementById("messages");
    chatBox.innerHTML = "";

    const msgs = messages[friendId] || [];

    msgs.forEach(msg => {
        const div = document.createElement("div");

        if (msg.from === my_id) {
            div.className = "msg my";
        } else {
            div.className = "msg friend";
        }

        div.textContent = msg.text;
        chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight; 
}

const chatMessages = document.getElementById("messages");

function renderMessage(from, text, date) {
    const msg = document.createElement("div");
    msg.classList.add("message");

    const my = Number(from) === Number(my_id);

    msg.classList.add(my ? "my" : "friend");

    msg.innerHTML = `
        <div class="msg-text">${text}</div>
        <div class="msg-time">${new Date(date).toLocaleTimeString()}</div>
    `;

    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}





function render_friends(friends = []){
    FriensContainer.innerHTML = "";

    send_button.onclick = () => {
        if (!selectedFriendId) return;
    
        const text = UserNameAccount + ": " + msg_input.value;
    
        
        server.send(JSON.stringify({
            type: "send_messages",
            from: my_id,
            to: selectedFriendId,
            message: text,
            date: Date.now()
        }));

    
      
        if (!messages[selectedFriendId]) messages[selectedFriendId] = [];
    
        messages[selectedFriendId].push({
            from: my_id,
            text: text,
            date: Date.now()
        });
    
        render_chat(selectedFriendId);
    
        msg_input.value = "";
    };

    for(let i = 0; i < friends.length; i++){

        const friend = friends[i]; 


        const btn = document.createElement("button");
        btn.classList.add("added_frien");

        const friendName = typeof friends[i] === "string" ? friends[i] : friends[i].name;

        const NameFriend = document.createElement("h3");

        NameFriend.textContent = friendName;
       

        let friend_account_name_now_text = document.getElementById("friend_account_name_now_text");


        btn.onclick = () => {
             selectedFriendId = friend.id;
             console.log("Выбран друг:", friend.name, "ID:", friend.id);

             server.send(JSON.stringify({
                 type: "get_messages",
                 from: my_id,
                 to: selectedFriendId
             }));

             friend_account_name_now_text.textContent = friend.name;

            if (window.innerWidth < 480) {
                document.getElementById("chat").style.display = "flex";
                document.getElementById("friends_container").style.display = "none";
            }

             
         
             render_chat(selectedFriendId);
        };
        

        btn.appendChild(NameFriend);

        FriensContainer.appendChild(btn);
    }
}

function requests_render(requests_friends) {
    const container = document.getElementById("requests_container");
    container.innerHTML = ""; 

    if(requests_friends.length === 0){
        alert("your request list is empty");
        return;
    }

    requests_friends.forEach(req => {
      

        const wrap = document.createElement("div");
        wrap.classList.add("request_friend");

        const name = document.createElement("h3");
        name.textContent = req.name;

        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "accept";

        const denyBtn = document.createElement("button");
        denyBtn.textContent = "deny";

        acceptBtn.onclick = () => {
            server.send(JSON.stringify({
                type: "accept_friend",
                my_id: my_id,
                friend_id: req.id
            }));

            wrap.remove(); 
        };

        denyBtn.onclick = () => {
            server.send(JSON.stringify({
                type: "deny_friend",
                my_id: my_id,
                friend_id: req.id
            }));

            wrap.remove();
        };

        wrap.appendChild(name);
        wrap.appendChild(acceptBtn);
        wrap.appendChild(denyBtn);
        container.appendChild(wrap);
    });
}




server.onmessage = (e) => {
    let data;

    try {
        data = JSON.parse(e.data);
        console.log(data);                 
    } catch {
        console.error("Не JSON:", e.data);
        return;
    }

    if (data.type === "login_success") {
        document.getElementById("log_site").remove();
        const chatPage = document.getElementById("chat_page");
        chatPage.style.display = "flex";

        const UserNameElement  = document.getElementById("UserName");
        UserNameElement.textContent = data.user;

        my_id = data.id;
        
        console.log(my_id);

        render_friends(data.friends);
        requests_render(data.Requestfriends)

        UserNameAccount = data.user;

        friends = data.friends;

        if (friends.length > 0) {
        selectedFriendId = friends[0].id;
        document.getElementById("friend_account_name_now_text").textContent = friends[0].name;

        
        server.send(JSON.stringify({
            type: "get_messages",
            from: my_id,
            to: selectedFriendId
        }));

    }
    }else if (data.type === "messages_history") {
        chatMessages.innerHTML = "";  

        messages[selectedFriendId] = data.messages;
    
        data.messages.forEach(msg => {
            renderMessage(msg.from, msg.text, msg.date);
        });
    }
    else if(data.type === "add_friend"){
        requests_render(data.Requestfriends);
        render_friends(data.friends);
    } else if (data.type === "error") {
        answer.textContent = data.message;
    }else if(data.type === "It's_already_your_friend"){
        alert("He is already your friend")
   } else if (data.type === "new_message") {

    if (!messages[data.from]) messages[data.from] = [];

    messages[data.from].push({
        from: data.from,
        text: data.text,
        date: data.date
    });

    renderMessage(data.from, data.text, data.date);
}
    else {
        console.log("Неизвестная команда:", data);
    }
};

document.getElementById('button_login').addEventListener('click', () => {
    const loginValue = document.getElementById("login").value;
    const passwordValue = document.getElementById("password").value;

    server.send(JSON.stringify({
        type: "login",
        user: UserNameAccount,
        name: loginValue,
        password: passwordValue
    }));
});



document.getElementById("add_friend_button").addEventListener('click', () => {
    const search_friends_input = document.getElementById("search_friends_input");
    const search_friends_input_value = search_friends_input.value;

    if(search_friends_input_value === UserNameAccount){
        alert("You can't add yourself as a friend.")
        return;
    }else{
        server.send(JSON.stringify({
        type: "find_friend",
        user: UserNameAccount,
        friend: search_friends_input_value
    }))
    }
})


//const debug_button = document.getElementById("debug_button");
//
//document.getElementById("debug_button").onclick = () => {
//    console.log("friends:", friends);
//    console.log("my_id:", my_id);
//    console.log("my_name:", UserNameAccount);
//    console.log("selectedFriendId:", selectedFriendId);
//};
