import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ Supabase client initialized");

document.getElementById("next-btn").addEventListener("click", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();
  const phone_number = document.getElementById("phone-number").value.trim();
  const dobMonth = document.getElementById("dob-month").value;
  const dobDay = document.getElementById("dob-day").value;
  const dobYear = document.getElementById("dob-year").value;

  if (password !== confirmPassword) {
    document.getElementById("password-error").textContent = "❌ Passwords do not match!";
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone_number,
          dob: `${dobYear}-${dobMonth}-${dobDay}`
        }
      }
    });

    if (error) {
      console.error("❌ Registration error:", error);
      alert(`❌ Registration failed: ${error.message}`);
      return;
    }

    if (data?.user) {
      const user_id = data.user.id;

      // ✅ Step 1: Insert into users table
      const { error: userInsertError } = await supabase.from("users").insert([
        {
          auth_id: user_id,
          name,
          email,
          phone_number,
          dob: `${dobYear}-${dobMonth}-${dobDay}`
        }
      ]);

      if (userInsertError) {
        console.error("❌ Failed to insert into users table:", userInsertError);
        return;
      }

      // ✅ Step 2: Insert into logs table
      const { error: logError } = await supabase.from("logs").insert([
        {
          action_type: "register",
          description: `New user registered with email: ${email}`,
          user_id: user_id, // <- UUID
          timestamp: new Date().toISOString()
        }
      ]);

      if (logError) {
        console.error("⚠️ Failed to insert log:", logError.message);
      } else {
        console.log("📝 Log entry saved.");
      }

      alert("✅ Registration successful! Check your email for verification.");
      window.location.href = "index.html";
    }

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    alert(`❌ An unexpected error occurred: ${err.message}`);
  }
});
