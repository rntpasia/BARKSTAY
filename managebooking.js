import { supabase } from "./supabase.js";

console.log("✅ managebooking.js loaded!");

// Room pricing configuration (same as in booking form)
const ROOM_PRICING = {
    "Standard": 1000,
    "Deluxe": 1400,
    "Suite": 2000
};

// Load booking data
const bookingData = JSON.parse(localStorage.getItem("bookingData"));

if (bookingData) {
  console.log("📄 Loaded bookingData:", bookingData);

  document.getElementById("checkInDate").textContent = bookingData.check_in || "-";
  document.getElementById("checkOutDate").textContent = bookingData.check_out || "-";
  document.getElementById("numRooms").textContent = bookingData.num_rooms || "-";
  document.getElementById("roomType").textContent = bookingData.room_type || "-";
  document.getElementById("numPets").textContent = bookingData.num_pets ?? "0";

  const checkIn = new Date(bookingData.check_in);
  const checkOut = new Date(bookingData.check_out);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  // Use the correct price per night based on room type
  const pricePerNight = ROOM_PRICING[bookingData.room_type] || 1400;
  const totalPrice = nights * bookingData.num_rooms * pricePerNight;

  document.getElementById("totalPrice").textContent = `₱${totalPrice.toFixed(2)}`;

  // Save to localStorage for reuse
  localStorage.setItem("totalAmount", totalPrice);
} else {
  console.warn("⚠️ No booking data found in localStorage.");
}

// Confirm Payment & Save booking + PayMongo link
document.getElementById("confirmPaymentBtn").addEventListener("click", async (e) => {
  e.preventDefault();

  if (!bookingData) {
    alert("⚠️ Booking data is missing!");
    return;
  }

  // Check if user is logged in
  const userId = localStorage.getItem("user_id") || localStorage.getItem("auth_id");
  if (!userId) {
    alert("⚠️ Please log in to continue with your booking.");
    window.location.href = "login.html"; // Adjust to your login page
    return;
  }

  const checkIn = new Date(bookingData.check_in);
  const checkOut = new Date(bookingData.check_out);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  if (nights < 1) {
    alert("❌ Check-out must be at least one day after check-in.");
    return;
  }

  // Use the correct price per night based on room type
  const pricePerNight = ROOM_PRICING[bookingData.room_type] || 1400;
  const totalAmount = nights * bookingData.num_rooms * pricePerNight;

  const finalBooking = {
    hotel_id: bookingData.hotel_id,
    user_id: userId,
    booking_date: new Date().toISOString(),
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    num_rooms: bookingData.num_rooms,
    room_type: bookingData.room_type,
    num_pets: bookingData.num_pets,
    total_amount: totalAmount,
    payment_status: "pending"   // ✅ Save as pending
  };

  console.log("✅ Saving booking to Supabase:", finalBooking);

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([finalBooking])
      .select()
      .single();

    if (error) {
      console.error("❌ Error inserting booking:", error);
      alert("Error saving booking. Please try again.");
      return;
    }

    console.log("✅ Booking saved:", data);

    // Generate PayMongo payment link with real amount in CENTAVOS (PHP x 100)
    const amountInCentavos = totalAmount * 100;

    const paymentPayload = {
      data: {
        type: "link",
        attributes: {
          amount: amountInCentavos,
          currency: "PHP",
          description: `Hotel Booking - ${bookingData.room_type} Room`,
          remarks: `Booking ID: ${data.bookings_id}` // Fixed: use bookings_id not booking_id
        }
      }
    };

    const paymentOptions = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Basic c2tfdGVzdF9NNWdSUTN3VDllR3Nvbmt6M2tCNmtNVXE6'
      },
      body: JSON.stringify(paymentPayload)
    };

    const response = await fetch('https://api.paymongo.com/v1/links', paymentOptions);
    const paymentResult = await response.json();
    
    console.log("✅ PayMongo response:", paymentResult);

    if (paymentResult.data && paymentResult.data.attributes && paymentResult.data.attributes.checkout_url) {
      const checkoutUrl = paymentResult.data.attributes.checkout_url;

      // Save IDs for status check later - use the correct booking ID field
      localStorage.setItem("bookingId", data.bookings_id); // Fixed: use bookings_id
      localStorage.setItem("paymongoLinkId", paymentResult.data.id);

      // Open PayMongo and redirect to payment status page
      window.open(checkoutUrl, '_blank');
      window.location.href = "paymentinprogress.html";
    } else {
      console.error("❌ Failed to generate PayMongo link:", paymentResult);
      alert("❌ Failed to generate payment link. Try again.");
      
      // If payment link creation fails, you might want to delete the booking
      // or mark it as failed to avoid orphaned records
      await supabase
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("bookings_id", data.bookings_id);
    }

  } catch (err) {
    console.error("❌ Error in booking/payment process:", err);
    alert("❌ An error occurred. Please try again.");
  }
});