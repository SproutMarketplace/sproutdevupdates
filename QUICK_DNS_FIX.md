# Quick DNS Fix for sproutmarketplace.app

## The Problem
Firebase is trying to verify domain ownership but can't find the correct DNS records.

## Quick Fix (5 minutes)

### Step 1: Go to your domain registrar
Wherever you bought `sproutmarketplace.app` (GoDaddy, Namecheap, Cloudflare, etc.)

### Step 2: Find DNS Management
Look for "DNS Management", "DNS Settings", or "Manage DNS"

### Step 3: Make these exact changes:

**DELETE this A record:**
- Type: A
- Name: @ (or sproutmarketplace.app)
- Value: 35.219.200.195

**ADD this A record:**
- Type: A  
- Name: @ (or sproutmarketplace.app)
- Value: 199.36.158.100

**ADD this TXT record:**
- Type: TXT
- Name: @ (or sproutmarketplace.app)
- Value: hosting-site=sprout-prod-4280b

### Step 4: Save changes and wait 5-10 minutes

### Step 5: Go back to Firebase console and click "Retry verification"

## Alternative: Use the working domain
Until you fix the DNS, users can use: https://sprout-prod-4280b.web.app/

This domain works perfectly and has all the same functionality.


