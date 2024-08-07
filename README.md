# Smart AI Discover

Smart AI Discover is an application built with Next.js, designed to collect and process trend data from the Google Trends API and store it in Firebase Realtime Database. The application also runs automated processes to update the status of trend data that has been used and performs search queries periodically.

## Prerequisites

Before starting, make sure you have set the following environment variables in the `.env.local` file:


```env
FIREBASE_CREDENTIALS='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "your-client-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email"
}'
FIREBASE_URL_DB=https://your-database-url.firebaseio.com
VALIDATION_KEY=your-validation-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```
Replace the value in the FIREBASE_CREDENTIALS variable with your valid Firebase credentials information.

## Getting Started

Follow these steps to get started with this application:
## Getting Started

Follow these steps to get started with this application:

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/smart-ai-discover.git
   cd smart-ai-discover
   ```
2. **Install Dependencies**
    ```bash
    npm install
    ```
3. **Set Up Environment Variables**
Create a `.env.local` file in the root directory of the project and add the environment variables as described above.

4. **Run Development Server**
    ```bash
    npm run dev
    ```

## Deploy to Vercel
If you want to deploy to Vercel, adjust the `.env` file according to your needs.