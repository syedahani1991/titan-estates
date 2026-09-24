# Titan Estates — Step-by-Step Guide to Going Dynamic

**Goal:** Turn your static HTML/CSS/JS site into a dynamic real estate site with live listings, a working contact form, and admin login — able to comfortably handle 1,000 visitors/day — without needing to learn a whole backend framework.

**The stack:**
- **Front end:** Your existing HTML/CSS/JS (no rewrite needed) — hosted on **Vercel** (already set up)
- **Back end:** **Supabase** — a free, hosted Postgres database that also gives you authentication and file storage, all accessed directly from your JavaScript. No server to build or maintain.

Why this combo: 1,000 users/day is light traffic. Supabase's free tier and Vercel's static hosting handle that easily, and you skip building/hosting/securing a custom server — which is usually the hardest part for someone new to backend dev.

---

## Part 1 — Set Up the Backend (Supabase)

### Step 1: Create your Supabase project
1. Go to [supabase.com](https://supabase.com) → Sign up (free) → **New Project**.
2. Pick a name (e.g. `titan-estates`), set a database password (save it somewhere safe), pick a region close to your users.
3. Wait ~2 minutes for it to spin up.

### Step 2: Create your database tables
In Supabase, go to **SQL Editor** → **New Query**, paste this, and run it:

```sql
-- Listings table
create table listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price numeric not null,
  location text,
  bedrooms int,
  bathrooms int,
  description text,
  image_url text,
  created_at timestamp default now()
);

-- Inquiries table (contact form submissions)
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id),
  name text not null,
  email text not null,
  message text,
  created_at timestamp default now()
);
```

### Step 3: Lock down access with Row Level Security (RLS)
This decides who can read/write what. Run this next:

```sql
-- Turn on RLS
alter table listings enable row level security;
alter table inquiries enable row level security;

-- Anyone can VIEW listings (public website)
create policy "Public can view listings"
on listings for select
using (true);

-- Only logged-in users (admins) can add/edit/delete listings
create policy "Admins can manage listings"
on listings for all
using (auth.role() = 'authenticated');

-- Anyone can SUBMIT an inquiry
create policy "Public can submit inquiries"
on inquiries for insert
with check (true);

-- Only logged-in users (admins) can VIEW inquiries
create policy "Admins can view inquiries"
on inquiries for select
using (auth.role() = 'authenticated');
```

### Step 4: Grab your API keys
Go to **Project Settings → API**. Copy:
- **Project URL**
- **anon public key** (safe to use in front-end code)

Never use the **service_role key** in front-end code — that one bypasses all security rules.

---

## Part 2 — Connect Your Front End

### Step 5: Add the Supabase client to your site
Create a new file `supabase-client.js` in your project root:

```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Then in your HTML pages, load it as a module:

```html
<script type="module" src="supabase-client.js"></script>
```

### Step 6: Load real listings dynamically
In a new `listings.js`:

```javascript
import { supabase } from './supabase-client.js';

async function loadListings() {
  const { data, error } = await supabase.from('listings').select('*');

  if (error) {
    console.error('Error loading listings:', error);
    return;
  }

  const container = document.getElementById('listings-container');
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
```

Give your listings section a container: `<div id="listings-container"></div>` in `index.html`, and load this script as a module too.

### Step 7: Wire up the contact/inquiry form
```javascript
import { supabase } from './supabase-client.js';

document.getElementById('inquiry-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { error } = await supabase.from('inquiries').insert({
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
  });

  if (error) {
    alert('Something went wrong, please try again.');
  } else {
    alert('Thanks! We\'ll get back to you soon.');
    e.target.reset();
  }
});
```

---

## Part 3 — Admin Login & Management

### Step 8: Add login for admins/agents
Create `admin-login.html` with an email/password form, then:

```javascript
import { supabase } from './supabase-client.js';

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    window.location.href = 'admin.html';
  }
}
```

Create your first admin user from **Supabase → Authentication → Add User**.

### Step 9: Build the admin add/edit/delete page
On `admin.html`, first check the user is logged in:

```javascript
import { supabase } from './supabase-client.js';

const { data: { session } } = await supabase.auth.getSession();
if (!session) window.location.href = 'admin-login.html';
```

Then add a listing:
```javascript
async function addListing(listing) {
  const { error } = await supabase.from('listings').insert(listing);
  if (error) alert(error.message);
  else alert('Listing added!');
}
```

Update and delete work the same way:
```javascript
supabase.from('listings').update({ price: 5000000 }).eq('id', listingId);
supabase.from('listings').delete().eq('id', listingId);
```

---

## Part 4 — Deploy & Test

### Step 10: Push to GitHub → auto-deploy on Vercel
```bash
git add .
git commit -m "Make site dynamic with Supabase"
git push
```
Vercel picks this up automatically since it's already connected.

**Important:** Don't hardcode your Supabase URL/key directly if you want to keep them out of your git history for cleanliness — you can use Vercel's **Environment Variables** and a small build step later, but for a static site, the anon key is designed to be public-safe, so committing it directly is fine to start with.

### Step 11: Test it like a QA engineer would
Since you already know Postman, Selenium, and Playwright, you're actually in a great spot to validate this properly:
- **Postman**: Supabase auto-generates a REST API for every table — you can hit `https://YOUR_PROJECT_URL/rest/v1/listings` directly with your anon key in headers to sanity-check data before wiring up the UI.
- **Playwright**: write a quick script that loads the homepage and asserts listing cards actually render (catches silent JS/data errors).
- **Manual exploratory testing**: submit the contact form with edge cases (empty fields, long text, special characters) to check your RLS policies actually block/allow the right things.

### Step 12: Basic load-readiness check for 1,000 users/day
1,000/day is roughly 1 request/minute on average — trivial for this stack. But two easy wins:
- Add an index on any column you'll filter/search by often (e.g. `location`):
  ```sql
  create index idx_listings_location on listings(location);
  ```
- Keep images reasonably compressed (use Supabase Storage or a CDN-hosted image, not huge uploads) — this affects page load speed more than backend load at this traffic level.

---

## Quick Troubleshooting
| Problem | Likely Cause |
|---|---|
| Listings don't show up | Check browser console for errors; confirm RLS policy allows public `select` |
| Form submit does nothing | Check `id`s in HTML match the JS; check console for errors |
| "Invalid API key" | Double-check you copied the `anon` key, not the `service_role` key |
| Admin page redirects even when logged in | Session check runs before login finishes — Supabase auth is async, make sure `await` is used |

---

## What to Build First
If you want a working end-to-end slice quickly: **Steps 1–4 (Supabase setup) → Step 6 (live listings) → Step 7 (contact form)**. Get that live before adding login/admin — it's the highest-value, lowest-risk chunk to ship first.
