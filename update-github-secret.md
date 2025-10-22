# How to Update MAILJET_SENDER_EMAIL in GitHub Secrets

## Option 1: Through GitHub Web Interface (Recommended)

1. **Go to your repository**: https://github.com/SproutMarketplace/sproutdevupdates
2. **Click on "Settings"** tab (top navigation)
3. **Click on "Secrets and variables"** in the left sidebar
4. **Click on "Actions"** 
5. **Find the secret named `MAILJET_SENDER_EMAIL`**
6. **Click "Update"** next to it
7. **Set the value to**: `info@sproutmarketplace.app`
8. **Click "Update secret"**

## Option 2: Through GitHub CLI (if you have it installed)

```bash
# Install GitHub CLI first if you don't have it
# Then run:
gh auth login
gh secret set MAILJET_SENDER_EMAIL --body "info@sproutmarketplace.app"
```

## Option 3: Manual Update via Repository Settings

1. Go to: https://github.com/SproutMarketplace/sproutdevupdates/settings/secrets/actions
2. Find `MAILJET_SENDER_EMAIL` and update it to `info@sproutmarketplace.app`

## After Updating the Secret

1. **Trigger a new deployment** by either:
   - Pushing a small change to your repository, or
   - Going to Actions tab and re-running the latest workflow

2. **Test your form** at: https://sprout-prod-4280b.web.app

The email will now be sent from `info@sproutmarketplace.app` instead of the previous email address.


