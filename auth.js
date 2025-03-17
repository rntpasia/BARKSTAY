import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ supabase is loaded!");

// Function to register a new user
async function registerUser(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const phoneNumber = document.getElementById("phone-number").value.trim();
    const dobMonth = document.getElementById("dob-month").value;
    const dobDay = document.getElementById("dob-day").value;
    const dobYear = document.getElementById("dob-year").value;
    const dob = `${dobYear}-${dobMonth}-${dobDay}`;

    // Validate passwords match
    if (password !== confirmPassword) {
        document.getElementById("password-error").textContent = "❌ Passwords do not match!";
        return;
    }

    // Validate phone number format
    if (!/^\d{11}$/.test(phoneNumber)) {
        document.getElementById("phone-number-error").textContent = "❌ Phone number must be 11 digits.";
        return;
    } else {
        document.getElementById("phone-number-error").textContent = "";
    }

    try {
        console.log("🚀 Attempting to register user...");

        // Step 1: Register user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) {
            console.error("❌ Auth Error:", authError);
            alert(`❌ Authentication Error: ${authError.message}`);
            return;
        }

        if (!authData?.user) {
            console.error("❌ No user data returned from Supabase.");
            alert("❌ Registration failed. Please try again.");
            return;
        }

        console.log("✅ User registered successfully:", authData);

        // Step 2: Get the user ID from Auth
        const userId = authData.user.id;
        console.log("✅ Retrieved user ID:", userId);

        // Step 3: Insert additional user data into 'users' table
        const { error: dbError } = await supabase
            .from("users")
            .upsert([
                {
                    auth_id: userId, // Links to auth.users
                    name: name,
                    email: email,
                    phone_number: phoneNumber,
                    dob: dob
                }
            ], { onConflict: ["auth_id"] }); // Ensures no duplicate entries

        if (dbError) {
            console.error("❌ Database Error:", dbError);
            alert(`❌ Database Error: ${dbError.message}`);
            return;
        }

        alert("✅ Registration successful! Check your email for verification.");
        alert("📩 Please verify your email before logging in!");

        // Redirect to login page
        window.location.href = "pet-attribute.html";

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
        alert(`❌ Error: ${err.message}`);
    }
}

// Function to log in a user
async function loginUser() {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert("❌ Login failed: " + error.message);
            return;
        }

        alert("✅ Login successful!");
        window.location.href = "home.html"; // Redirect to home.html after login

    } catch (err) {
        console.error("❌ Unexpected Error:", err);
        alert(`❌ Error: ${err.message}`);
    }
}

// Attach event listeners on page load
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login");

    if (registerForm)registerForm.addEventListener("submit", registerUser);

    
    loginForm.addEventListener("click", async function(event){
            event.preventDefault();
            console.log("button clicked");
            await loginUser();
        });
