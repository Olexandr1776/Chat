let server = new WebSocket("ws://26.59.64.179:8080");


server.onopen = () => console.log("подключено");

const answer = document.getElementById("answer");

const FriensContainer = document.getElementById("friends_container_friend");

const msg_input = document.getElementById("message_input");

let messages = {}; 


let friends = [];

let my_id = 1;

let UserNameAccount = "";

let selectedFriendId = null;


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


function render_friends(friends = []){
    FriensContainer.innerHTML = "";

    send_button.onclick = () => {
        if (!selectedFriendId) return;
    
        const text = UserNameAccount + ": " + msg_input.value;
    
        
        server.send(JSON.stringify({
            type: "send_messages",
            from: my_id,
            to: selectedFriendId,
            text: text,
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

             friend_account_name_now_text.textContent = friend.name;

            if (window.innerWidth < 431) {
                document.getElementById("chat").style.display = "flex";
                document.getElementById("friends_container").style.display = "none";
            }

             
         
             render_chat(selectedFriendId);
        };
        

        btn.appendChild(NameFriend);

        FriensContainer.appendChild(btn);
    }
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
        UserNameElement.textContent = data.name;

        my_id = data.id;
        
        console.log(my_id);

        render_friends(data.friends);

        UserNameAccount = data.name;
    }else if(data.type === "add_friend"){
        friends = data.friends;
        render_friends(data.friends);
    } else if (data.type === "error") {
        answer.textContent = data.message;
    }else if(data.type === "It's_already_your_friend"){
        alert("He is already your friend")
    }else if(data.type === "new_message"){
        const friendId = data.from;

        if (!messages[friendId]) messages[friendId] = [];

            messages[friendId].push({
                from: data.from,
                text: data.text,
                date: data.date
            });

        if (selectedFriendId === friendId) {
            render_chat(friendId);
        }

    }else {
        console.log("Неизвестная команда:", data);
    }
};

document.getElementById('button_login').addEventListener('click', () => {
    const loginValue = document.getElementById("login").value;
    const passwordValue = document.getElementById("password").value;

    server.send(JSON.stringify({
        type: "login",
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
        name: search_friends_input_value
    }))
    }
})


//const debug_button = document.getElementById("debug_button");
//
//document.getElementById("debug_button").onclick = () => {
//    console.log("friends:", friends);
//    console.log("my_id:", my_id);
//    console.log("selectedFriendId:", selectedFriendId);
//};
