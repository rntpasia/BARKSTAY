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
