import { supabase } from './supabase-client.js';

async function loadListings() {
  const { data, error } = await supabase.from('listings').select('*');

  if (error) {
    console.error('Error loading listings:', error);
    return;
  }

  const container = document.getElementById('listings-container');

  if (data.length === 0) {
    container.innerHTML = '<p>No listings yet — check back soon!</p>';
    return;
  }

  container.innerHTML = data.map(listing => `
    <div class="listing-card">
      <img src="${listing.image_url}" alt="${listing.title}">
      <h3>${listing.title}</h3>
      <p>${listing.location} — ₹${listing.price}</p>
      <p>${listing.bedrooms} BHK</p>
    </div>
  `).join('');
}

loadListings();                           