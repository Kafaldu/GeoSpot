#  GeoSpot Setup Guide


---

## Backend Setup (Render)

We’re hosting the backend on **Render**, so you don’t need to run it locally.

### Steps:

1. Go to our [Render Dashboard](https://dashboard.render.com/) and log in.
2. Locate the `geospotbackend` service.
3. Click **"Deploy latest commit"** to update the backend with the latest code.
4. Wait for the deployment logs to show **“Live”** — this means the backend is running.

### Backend API URL:
```
https://geospotbackend.onrender.com
```

> This is already integrated into the frontend fetch calls.

---

## Frontend Setup (React Native with Expo)

You’ll be running the frontend using **Expo Go** on your phone or using the web browser via tunnel.

### 🔧 Initial Setup (One-Time)

> If you haven’t already:

```bash
npm install -g expo-cli
```

---

## Run the Frontend

1. Open a terminal and go to the root of the project:

   ```bash
   cd geospot  # if not already there
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Expo using **tunnel mode** (important for physical device access):

   ```bash
   npx expo start --tunnel
   ```

   This will open **Expo DevTools** in your browser.

---

## Run the App on Your Phone

1. Download the **Expo Go** app:
   - iOS: App Store
   - Android: Google Play

2. Make sure your phone and computer are on the **same Wi-Fi network**.

3. In **Expo DevTools**, **scan the QR code** shown under "Tunnel" using the **Expo Go** app.

   Your app should launch on your phone!

---

## Troubleshooting Tips

- **Backend not working?** Make sure you clicked **Deploy latest commit** on Render.
- **Can’t scan the QR?** Ensure your phone and laptop are on the **same Wi-Fi**, and you’re using **Tunnel mode** (`--tunnel`).

---