# Troubleshooting Guide

## Issue 1: Category Item Counts Not Showing Real Data

### Problem
The "Internet Services" and "Categories" items show incorrect or placeholder numbers instead of real data counts.

### Diagnosis Steps
1. **Hot restart** the app on your device
2. Check the console output for these logs:
   ```
   🔄 Fetching data packages count...
   📦 Data Packages API Response:
      Status: Success
      Number of companies: X
      - Company1: Y packages
   ✅ Total packages count: N
   ```

### Possible Causes & Solutions

#### A. Network Error (Most Common)
**Symptoms:** Console shows `❌ Error getting data packages count` or `⚠️ No data packages found`

**Cause:** The app cannot reach `https://daato.so/api` from your real device

**Solutions:**
1. Ensure your device has internet connection
2. Check if `https://daato.so` is accessible from your network
3. Try using a VPN if the API is geo-restricted
4. Verify the backend API is running and accessible

#### B. API Response Format Changed
**Symptoms:** Console shows `Number of companies: 0` even though API responds

**Solution:** The API response structure may have changed. Check the actual response format.

#### C. Wrong API Endpoint
**Current endpoint:** `https://daato.so/api/findReseller`
**Reseller phone:** `615775378`

If this is incorrect, update in:
`lib/features/data_packages/data/data_packages_api_service.dart`

---

## Issue 2: Back Button Not Working Anywhere

### Problem
The back button (both app bar back button and Android system back button) doesn't navigate back to previous screens.

### Diagnosis
All screens are correctly using `Get.back()` for navigation. The issue is likely one of:

1. **Navigation Stack Issue** - Screens pushed incorrectly
2. **Android System Back** - Not handled by GetX
3. **Multiple Contexts** - Navigation context conflicts

### Quick Test
Try these in order:

#### Test 1: Check Navigation Stack
Add this to any screen where back doesn't work:
```dart
print('Can pop: ${Navigator.of(context).canPop()}');
print('GetX can back: ${Get.key.currentState?.canPop()}');
```

#### Test 2: Force Navigation
Replace `Get.back()` with:
```dart
if (Navigator.of(context).canPop()) {
  Navigator.of(context).pop();
} else {
  Get.back();
}
```

#### Test 3: Check for WillPopScope
Search for `WillPopScope` or `PopScope` that might be blocking back navigation.

### Permanent Solutions

#### Solution A: Add Global Back Handler
In `main.dart`, ensure GetMaterialApp has:
```dart
GetMaterialApp(
  // ... other properties
  popGesture: true, // Enable swipe to go back
  enableLog: true,  // See navigation logs
)
```

#### Solution B: Use Navigator Instead of Get
If GetX navigation is problematic, replace:
```dart
Get.back() → Navigator.of(context).pop()
Get.to() → Navigator.of(context).push()
```

#### Solution C: Check Main Navigation
Verify `MainNavigation` widget isn't preventing back navigation with `WillPopScope`.

---

## How to Report Issues

When reporting, please provide:

1. **Console logs** - Copy all output from app startup
2. **Screen name** - Which screen has the issue
3. **Steps to reproduce** - Exact steps to trigger the problem
4. **Expected vs Actual** - What should happen vs what happens
5. **Device info** - Android version, device model

---

## Quick Fixes Applied

✅ Added detailed logging for data packages count
✅ Fixed pluralization (1 item vs 2 items)
✅ Fixed category card overflow issue
✅ Updated API config for real device (192.168.0.109)

## Next Steps

1. **Hot restart** the app
2. Check console for data count logs
3. Test back button on each screen
4. Report findings with console output
