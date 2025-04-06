Setup Instructions:
1. Install backend dependencies:
   cd backend
   npm install

2. Install frontend dependencies:
   cd ../
   npm install

3. Install UUID package for generating unique user IDs:
   cd backend
   npm install uuid

4. Start the backend server:
   cd backend
   npm start
   (runs backend on http://localhost:3000)

5. Start the frontend (Expo for React Native Web):
   npm start
   (opens Expo DevTools at http://localhost:8081)
   Press 'w' to run in web browser.

Expo Setup (if you don't have Expo CLI):
- Install Expo CLI globally: npm install -g expo-cli
- Create a free Expo account at https://expo.dev/
- (Optional) Install Expo Go app on your phone to test on physical device.

Important Notes:
- Backend must be running before using the app.
- Signup generates a unique UID for each user.
- Duplicate email protection is implemented.

- If port 3000 is in use, stop previous processes.
- If testing on a real device instead of localhost, use ngrok or your local IP address.

- NOTE: To view as mobile app:
- right click on screen, click inspect
- navigate to little phone icon and click on it
- select type of phone display you would like to visualize
