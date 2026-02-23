
let isLogin = false;

function toggleForm(){
    const title = document.getElementById("formTitle");
    const button = document.querySelector("button");
    const switchText = document.querySelector(".switch");
    const message = document.getElementById("message");

    message.textContent = "";

    if(isLogin){
        title.textContent = "Register 📝";
        button.textContent = "Register";
        switchText.textContent = "Already have an account? Login";
        isLogin = false;
    } else {
        title.textContent = "Login 🔐";
        button.textContent = "Login";
        switchText.textContent = "Don't have an account? Register";
        isLogin = true;
    }
}

function handleAuth(){
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    if(user === "" || pass === ""){
        message.className = "error";
        message.textContent = "Please fill all fields";
        return;
    }

    if(isLogin){
        const storedUser = localStorage.getItem("username");
        const storedPass = localStorage.getItem("password");

        if(user === storedUser && pass === storedPass){
            message.className = "success";
            message.textContent = "Login Successful!";
        } else {
            message.className = "error";
            message.textContent = "Invalid credentials";
        }

    } else {
        localStorage.setItem("username", user);
        localStorage.setItem("password", pass);

        message.className = "success";
        message.textContent = "Registration Successful! Now login.";
    }
}