import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ supabase is loaded!");

  let user = await getUser();
  if (!user) {
    alert("You must be logged in to access this page.");
    window.location.href = "index.html";
    return;
  }

  if (!user.id) {
    console.log("No user ID");
    return;
  }

  console.log("User ID: ", user.id);

  const { data, error } = await supabase.from("users").select("*").eq("auth_id", user.id).single();
  if (error) {
    console.error("error: ", error);
    return;
  }

  if (data) {
    console.log("User data:", data);
    const usernameInput = document.getElementById("username");
    const phoneInput = document.getElementById("phone_number");

    if (usernameInput) {
      usernameInput.value = data.name || "";
    }

    if (phoneInput) {
      phoneInput.value = data.phone_number || "";
    }
  }

  async function updateUserAccount() {
    const username = document.getElementById("username")?.value.trim() || "";
    const phone_number = document.getElementById("phone_number")?.value.trim() || "";
    const auth_id = localStorage.getItem("auth_id");

    if (!auth_id) {
      console.error("❌ Error: User ID not found in local storage.");
      return;
    }

    const { data: updateData, error: updateError } = await supabase
      .from("users")
      .update({ name: username, phone_number })
      .eq("auth_id", auth_id);

    if (updateError) {
      console.error("❌ Error updating account information:", updateError);
      return;
    }

    console.log("✅ Username updated successfully:", updateData);

    // Insert into logs
    const { error: logError } = await supabase.from("logs").insert([
  {
    action_type: "profile_edit",
    description: `Updated name to "${username}", phone to "${phone_number}"`,
    user_id: auth_id, // ✅ correct column name
    timestamp: new Date().toISOString()
  }
]);


    if (logError) {
      console.error("⚠️ Failed to log update action:", logError);
    } else {
      console.log("📝 Audit log saved.");
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

  if (editenabled) {
    editenabled.addEventListener("click", function () {
      console.log("button is clicked");
      enableEditing("username");
    });
  }

  if (disableEdit) {
    disableEdit.addEventListener("keypress", function (event) {
      disableEditing(event, "username");
    });
  }

  const submit = document.getElementById("submit");
  if (submit) {
    submit.addEventListener("click", async function (event) {
      event.preventDefault();
      console.log("Submit button clicked");
      await updateUserAccount();
      alert("Your information has been saved!");
      window.location.href = "manage.html";
    });
  }

  // Helper
  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return null;
    }

    localStorage.setItem("auth_id", data.user.id);
    return data.user;
  }
});