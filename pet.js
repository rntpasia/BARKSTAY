import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Initialize Supabase
const SUPABASE_URL = "https://cwqhiwfmiymomtxgycwx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cWhpd2ZtaXltb210eGd5Y3d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTA3ODcsImV4cCI6MjA1NzcyNjc4N30.1fpWjVox5v2dAGM-MxXihwzdeuOb_Yxm-0Lr0Z8yLoU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("✅ pet.js is loaded!");

// Fetch and display pets on page load
document.addEventListener("DOMContentLoaded", fetchPets);

// Form submission handler
document.getElementById("pet-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("🚀 Attempting to save pet...");

    // Get form values
    const petName = document.getElementById("pet-name").value.trim();
    const breed = document.getElementById("breed").value.trim();
    const size = document.getElementById("size").value;
    const age = document.getElementById("age").value.trim();
    const ageUnit = document.getElementById("age-unit").value;
    const diet = document.getElementById("diet").value.trim();
    const petImage = document.getElementById("photo").files[0];

    // Check required fields
    if (!petName || !breed || !size || !age || !ageUnit || !diet || !petImage) {
        alert("❌ Please fill in all fields.");
        return;
    }

    console.log("🖼 Uploading image...");

    // Create unique filename
    const filePath = `pets/${Date.now()}_${petImage.name}`;

    // Upload Image to Supabase Storage
    const { data: imageData, error: imageError } = await supabase.storage
        .from("pet-images")
        .upload(filePath, petImage, {
            contentType: petImage.type, // Ensuring correct content type
            cacheControl: "3600",
            upsert: false
        });

    if (imageError) {
        console.error("❌ Image Upload Error:", imageError.message);
        console.error("🔎 Full Error Object:", imageError);
        alert("❌ Failed to upload pet image.");
        return;
    }

    console.log("✅ Image uploaded successfully!");

    // Get the public URL of the uploaded image
    const { data } = supabase.storage
        .from("pet-images")
        .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    if (!imageUrl) {
        console.error("❌ Error retrieving public image URL.");
        alert("❌ Failed to get image URL.");
        return;
    }

    console.log("🌍 Public Image URL:", imageUrl);

    console.log("📂 Saving pet data to database...");

    // Insert Pet Data into Supabase
    const { error: dbError } = await supabase
        .from("pets")
        .insert([
            {
                pet_name: petName,
                breed: breed,
                size: size,
                age: parseInt(age),
                age_unit: ageUnit,
                diet: diet,
                pet_photo: imageUrl
            }
        ]);

    if (dbError) {
        console.error("❌ Database Error:", dbError.message);
        alert("❌ Failed to save pet details.");
        return;
    }

    console.log("✅ Pet saved successfully!");
    alert("✅ Pet saved successfully!");
    window.location.href="home.html";

    // Clear form and refresh displayed pets
    document.getElementById("pet-form").reset();
    fetchPets();
});

// Fetch and display pets
async function fetchPets() {
    console.log("🔄 Fetching pets...");

    const { data: pets, error } = await supabase
        .from("pets")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("❌ Fetch Error:", error.message);
        return;
    }

    console.log("✅ Pets fetched:", pets);
}

// Go back function
function goBack() {
    window.history.back();
}
