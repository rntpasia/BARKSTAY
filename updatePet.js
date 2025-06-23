import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ pet.js is loaded!");

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

//retrieve pet info
const petInfo = document.getElementById("petInfo");


if(petInfo){
    let auth_id = localStorage.getItem("auth_id");
    const {data, error} = await supabase.from("pets").select("*").eq("auth_id", auth_id).single();
if (error){
    console.error("error: ", error);
}

if(data) {  
    console.log("User data:", data);  
    document.getElementById("pet_name").value = data.pet_name || ""; 
    document.getElementById("breed").value = data.breed || ""; 
    document.getElementById("size").value = data.size || ""; 
    document.getElementById("diet").value = data.diet|| ""; 
}


async function updatePets(){

    let auth_id = localStorage.getItem("auth_id");
    let pet_name = document.getElementById("pet_name").value;
    let breed = document.getElementById("breed").value;
    let size = document.getElementById("size").value;
    let diet = document.getElementById("diet").value;


    const {data, error} = await supabase.from("pets").update([{
        pet_name,
        breed,
        size,
        diet
    }]).eq("auth_id", auth_id).single();

    if(error){
        console.log("error: ", error);
    }
    alert("Update Successful!");
}

const saveBtn = document.getElementById("saveBtn");
saveBtn.addEventListener("click", async function(event){
    event.preventDefault();
    console.log("button clicked");
    await updatePets();
    window.location.href = "manage.html";

});
}