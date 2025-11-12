# How to Fix JDoodle Credentials

## Problem
"Unauthorized Request" (403) error when testing code execution.

## Solution

### Option 1: Use Update Script (Recommended)
1. Go to: `http://localhost/capstoneproject/update_jdoodle_credentials.php`
2. Enter your new Client ID and Client Secret from JDoodle dashboard
3. Click "Update Credentials"
4. **RESTART APACHE/XAMPP** (IMPORTANT!)
5. Test again

### Option 2: Manual Update

1. **Get credentials from JDoodle:**
   - Login: https://www.jdoodle.com/api-compiler
   - Go to API Dashboard
   - Copy Client ID and Client Secret

2. **Edit `.htaccess` file:**
   ```apache
   # Environment variables for the application
   SetEnv JDOODLE_CLIENT_ID "YOUR_NEW_CLIENT_ID_HERE"
   SetEnv JDOODLE_CLIENT_SECRET "YOUR_NEW_CLIENT_SECRET_HERE"
   ```

3. **Restart Apache/XAMPP:**
   - Open XAMPP Control Panel
   - Stop Apache
   - Start Apache

4. **Test:**
   - Go to: `http://localhost/capstoneproject/test_jdoodle.php`
   - Should show "✅ SUCCESS!"

## Important Notes

- **Always restart Apache after updating `.htaccess`**
- Credentials must match exactly (no extra spaces)
- Free tier has daily limits - if exceeded, wait until next day
- If credentials expired, generate new ones from JDoodle dashboard

## Verify Credentials

After updating, test at:
- `http://localhost/capstoneproject/test_jdoodle.php`

This will show:
- ✅ If credentials are loaded correctly
- ✅ If API connection works
- ❌ Any errors with details

