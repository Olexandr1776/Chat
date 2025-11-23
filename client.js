let server = new WebSocket("wss://rosalyn-unparoled-larita.ngrok-free.dev");


server.onopen = () => console.log("подключено")

let login_button = document.getElementById('button_login');

const answer = document.getElementById("answer");

login_button.addEventListener('click', () =>{
    const input_login = document.getElementById("login");
    const loginValue = input_login.value;
    
    const input_password = document.getElementById("password");
    const passwordValue = input_password.value;

    const confirm_password = document.getElementById("confirm_password");
    const ValueConfirmPassword = confirm_password.value;

    if(ValueConfirmPassword !== passwordValue){
      answer.textContent = "Passwords must match in both fields."
    }else if(passwordValue.length < 8){
      answer.textContent = "The password must be at least eight";
    }else if(!/[0-9]/.test(passwordValue)){
      answer.textContent = "The password must contain at least one character.";
    }else if (!/[A-Z]/.test(passwordValue)){
      answer.textContent = "The password must contain at least one character.";
    }else{
      server.send(JSON.stringify({
      type: "add_user",
      name: loginValue,
      password: passwordValue
    }));
      server.onmessage = (e) => {
      console.log("📨 Ответ сервера:", e.data);
      answer.textContent = e.data; 
    };
    }



})
