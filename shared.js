// ============================================================
// shared.js — used by index.html, properties.html, property.html
// Supabase connection, dummy sample data, and shared helper functions
// ============================================================

const supabaseClient = supabase.createClient(
  'https://chazzeivbcgvazgvkbsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYXp6ZWl2YmNndmF6Z3ZrYnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjQ0NDUsImV4cCI6MjEwNTE0MDQ0NX0.GL9jg4aoVb71yXO0OyMWDoGkps_Vy_H9lEBNuN1Ok8k'
);

// Dummy sample listings — shown alongside real Supabase data until enough real listings exist.
// NOTE: "Modern 3 BHK in Whitefield" intentionally removed — a real Supabase listing already
// exists with that same title (see the "duplicate card" fix from earlier).
const dummyProperties = [
  { id: 'dummy-2', title: '4 BHK Villa in Indiranagar', location: 'Indiranagar, Bengaluru', type: 'Villa', price: '₹2.5 Crores', priceNum: 250, beds: 4, baths: 3, area: '3,000 sqft', icon: '🏡', description: 'Beautiful independent villa with garden, parking for 2 cars, and modern architecture. Perfect for families.', completionYear: '2027', createdAt: '2024-03-05' },
  { id: 'dummy-3', title: 'Commercial Space in MG Road', location: 'MG Road, Bengaluru', type: 'Commercial', price: '₹1.2 Crores', priceNum: 120, beds: 0, baths: 2, area: '2,500 sqft', icon: '🏢', description: 'Prime commercial space ideal for startups and established businesses. High visibility, excellent connectivity.', completionYear: '2023', createdAt: '2023-11-20' },
  { id: 'dummy-4', title: '2 BHK Flat in Koramangala', location: 'Koramangala, Bengaluru', type: 'Apartment', price: '₹65 Lakhs', priceNum: 65, beds: 2, baths: 1, area: '900 sqft', icon: '🏠', description: 'Cozy apartment in vibrant Koramangala locality with easy access to cafes, restaurants, and shopping centers.', completionYear: '2025', createdAt: '2024-06-15' },
  { id: 'dummy-5', title: 'Luxury 3 BHK in Sarjapur Road', location: 'Sarjapur Road, Bengaluru', type: 'Villa', price: '₹1.8 Crores', priceNum: 180, beds: 3, baths: 2, area: '2,200 sqft', icon: '👑', description: 'Premium villa with landscaped garden, home theater, and smart home features. Gated community with excellent amenities.', completionYear: '2026', createdAt: '2024-08-01' },
  { id: 'dummy-6', title: 'Office Space in Ambience Mall', location: 'Vasant Kunj, Delhi', type: 'Commercial', price: '₹3 Crores', priceNum: 300, beds: 0, baths: 4, area: '4,000 sqft', icon: '🏛️', description: 'Prestigious office space in iconic location with premium infrastructure and high foot traffic.', completionYear: '2028', createdAt: '2024-09-10' }
];

function possessionStatus(completionYear) {
  const year = parseInt(completionYear, 10);
  if (!year || isNaN(year)) return null;
  const currentYear = new Date().getFullYear();
  return year <= currentYear ? 'ready' : 'construction';
}

function possessionLabel(status) {
  if (status === 'ready') return 'Ready to Move';
  if (status === 'construction') return 'Under Construction';
  return null;
}

// Fetches dummy + real Supabase listings and returns them as one combined array.
// Every page that needs property data calls this instead of querying Supabase directly.
async function getAllProperties() {
  const { data, error } = await supabaseClient.from('listings').select('*');
  let dbProperties = [];
  if (error) {
    console.error('Error loading listings:', error);
  } else {
    dbProperties = data.map(row => ({
      id: row.id,
      title: row.title,
      location: row.location,
      type: row.type,
      price: '₹' + row.price,
      priceNum: row.price,
      beds: row.bedrooms,
      baths: row.bathrooms,
      area: row.area || '',
      icon: row.icon || '🏠',
      description: row.description,
      completionYear: row.completion_year,
      createdAt: row.created_at,
      bankLoanSupport: !!row.bank_loan_support,
      googleMapsLink: row.google_maps_link || null,
      masterPlanUrl: row.master_plan_url || null,
      floorPlan2bhkUrl: row.floor_plan_2bhk_url || null,
      floorPlan3bhkUrl: row.floor_plan_3bhk_url || null,
      imageUrl: row.image_url || null,
      galleryUrls: Array.isArray(row.gallery_urls) ? row.gallery_urls : []
    }));
  }
  return [...dummyProperties, ...dbProperties];
}

// Reads simple key=value query params from the current page URL (used to carry
// search terms from index.html's search box into properties.html).
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params.entries()) result[key] = value;
  return result;
}
