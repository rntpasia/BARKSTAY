import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ supabase is loaded!");

let user = await getUser();
  if(!user){
      alert("You must be logged in to access this page.");
      window.location.href="index.html";
  }

async function getUser(){ //retrieves user id 
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        return null;
    }

    localStorage.setItem("auth_id", data.user.id);
    
    return data.user;

}

if (!user.id){
    console.log("No user ID");
}
console.log("User ID: ", user.id);
const {data, error} = await supabase.from("users").select("*").eq("auth_id", user.id).single();
if (error){
    console.error("error: ", error);
}

if(data) {  
    console.log("User data:", data);  
    document.getElementById("username").value = data.name || "No name found"; 
    document.getElementById("phone_number").value = data.phone_number || "No number found";  //display user name in html
}

//update username

async function updateUserAccount(){
let username = document.getElementById("username").value || "";
let phone_number = document.getElementById("phone_number").value || "";

  let auth_id = localStorage.getItem("auth_id");

  if (!auth_id) {
    console.error("Error: User ID not found in local storage.");
  }
  const {data: updateData, error: updateError} = await supabase.from("users").update({name: username, phone_number}).eq("auth_id", auth_id);

  if (updateError) {
    console.error("Error updating account information: ", error);
  } else {
    console.log("Username updated successfully.");
  }
}


async function disableEditing(event, id) {
        let usernameInput = document.getElementById(id);
        if (event.key === 'Enter') {
            usernameInput.setAttribute('readonly', true);
            if (usernameInput.value.trim() !== '') {
                await updateUserAccount();
            }
        }
    }
    
    function enableEditing(id) {
        let usernameInput = document.getElementById(id);
        usernameInput.removeAttribute('readonly');
        document.getElementById(`edituser`).classList.remove('hidden');
        usernameInput.focus();
    }
    
    let editenabled = document.getElementById("editenabled");
    let disableEdit = document.getElementById("username");
    if(editenabled){
        editenabled.addEventListener("click", function() {
            console.log("button is clicked");
            enableEditing("username");
        });

    }
    if (disableEdit){
        disableEdit.addEventListener("keypress", function(event) {
            disableEditing(event, "username");
        });

    }
        ////////PI////////

    const submit = document.getElementById("submit");
     submit.addEventListener('click', async function(event){
                    event.preventDefault();
                    console.log("button is clicked");
                    await updateUserAccount();
                });
                ////////////PET INFO/////////

    