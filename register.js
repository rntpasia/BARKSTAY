// Initialize Supabase (Replace with your actual Supabase credentials)
const SUPABASE_URL = "yhttps://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById("next-btn").addEventListener("click", async function () {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const phoneNumber = document.getElementById("phone-number").value.trim();
    const dobMonth = document.getElementById("dob-month").value;
    const dobDay = document.getElementById("dob-day").value;
    const dobYear = document.getElementById("dob-year").value;

    // Validate passwords
    if (password !== confirmPassword) {
        document.getElementById("password-error").textContent = "❌ Passwords do not match!";
        return;
    }

    try {
        // Create user in Supabase Auth
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name, phoneNumber, dob: `${dobYear}-${dobMonth}-${dobDay}` } }
        });

        if (error) throw error;

        alert("✅ Registration successful! Check your email for verification.");
        window.location.href = "index.html"; // Redirect to login page after registration
    } catch (err) {
        alert(`❌ Error: ${err.message}`);
    }
});
