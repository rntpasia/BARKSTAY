import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("✅ Supabase client initialized");

document.addEventListener("DOMContentLoaded", () => {
  // Register a new user
  async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const phoneNumber = document.getElementById("phone-number").value.trim();
    const dobMonth = document.getElementById("dob-month").value;
    const dobDay = document.getElementById("dob-day").value;
    const dobYear = document.getElementById("dob-year").value;
    const dob = `${dobYear}-${dobMonth}-${dobDay}`;
    const birthdate = new Date(dob);
    const today = new Date();

    // Validate password match
    if (password !== confirmPassword) {
      document.getElementById("password-error").textContent = "❌ Passwords do not match!";
      return;
    }

    // Validate age >= 18
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    const dayDiff = today.getDate() - birthdate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
    if (age < 18) {
      document.getElementById("dob-error").textContent = "❌ You must be 18 years old to register.";
      return;
    } else {
      document.getElementById("dob-error").textContent = "";
    }

    // Validate phone number
    if (!/^\d{11}$/.test(phoneNumber)) {
      document.getElementById("phone-number-error").textContent = "❌ Phone number must be 11 digits.";
      return;
    } else {
      document.getElementById("phone-number-error").textContent = "";
    }

    try {
      console.log("Attempting to register user...");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("❌ Auth Error:", authError);
        alert(`Authentication Error: ${authError.message}`);
        return;
      }

      if (!authData?.user) {
        console.error("❌ No user data returned");
        alert("Registration failed. Please try again.");
        return;
      }

      const userId = authData.user.id;
      console.log("User registered:", userId);

      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', name);
      console.log("✅ User data stored in localStorage");

      const { error: dbError } = await supabase.from("users").upsert(
        [{
          auth_id: userId,
          name,
          email,
          phone_number: phoneNumber,
          dob,
        }],
        { onConflict: ["auth_id"] }
      );

      if (dbError) {
        console.error("❌ DB Insert Error:", dbError);
        alert(`Database Error: ${dbError.message}`);
        return;
      }

      const { error: logError } = await supabase.from("logs").insert([
        {
          action_type: "register",
          description: `New user registered with email: ${email}`,
          user_id: userId, // Make sure this column is UUID
          timestamp: new Date().toISOString(),
        }
      ]);

      if (logError) {
        console.error("⚠️ Log insert failed:", logError);
      } else {
        console.log("📝 Registration logged.");
      }

      alert("✅ Registration successful!");
      
      window.location.href = `pet-attribute.html?user_id=${userId}`;
      alert("Registration successful!");
    
      window.location.href = "pet-attribute.html";

    } catch (err) {
      console.error("❌ Unexpected error:", err);
      alert(`Error: ${err.message}`);
    }
  }

  async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      console.log("Attempting to login user...");
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("❌ Login error:", error);
        alert("❌ Login failed: " + error.message);
        return;
      }

      if (!data?.user) {
        alert("❌ Login failed. Please try again.");
        return;
      }

      const userId = data.user.id;
      const userEmail = data.user.email;
      
      console.log("✅ User logged in successfully:", userId);

      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_email', userEmail);
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, phone_number, dob')
          .eq('auth_id', userId)
          .single();

        if (userData) {
          localStorage.setItem('user_name', userData.name || '');
          localStorage.setItem('user_phone', userData.phone_number || '');
          localStorage.setItem('user_dob', userData.dob || '');
          console.log("✅ User details stored in localStorage");
        }
      } catch (fetchError) {
        console.log("⚠️ Could not fetch user details:", fetchError);
      }

      try {
        const { error: logError } = await supabase.from("logs").insert([
          {
            action_type: "login",
            description: `User logged in with email: ${userEmail}`,
            user_id: userId,
            timestamp: new Date().toISOString(),
          }
        ]);

        if (logError) {
          console.error("⚠️ Log insert failed:", logError);
        } else {
          console.log("📝 Login logged.");
        }
      } catch (logError) {
        console.log("⚠️ Could not log login action:", logError);
      }

      alert("✅ Login successful!");
      
      window.location.href = `home.html?user_id=${userId}`;

    } catch (err) {
      console.error("❌ Login error:", err);
      alert(`Error: ${err.message}`);
    }
  }

  async function checkAuthStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("✅ User is already logged in:", user.id);
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_email', user.email);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error checking auth status:", error);
      return null;
    }
  }

  checkAuthStatus();

  // Attach events only if elements exist
  const registerForm = document.getElementById("register-form");
  const loginButton = document.getElementById("login");

  if (registerForm) {
    registerForm.addEventListener("submit", registerUser);
  }

  if (loginButton) {
    loginButton.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("Login button clicked");
      await loginUser();
    });
  }
});