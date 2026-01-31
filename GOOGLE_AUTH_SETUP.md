# Google Login Setup Guide

Since I cannot access your private dashboards, you must perform these configuration steps to make Google Login work.

## Step 1: Create Google Cloud Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a new Project (or select an existing one).
3. Go to **APIs & Services > OAuth consent screen**.
   - Select **External** and click Create.
   - Fill in the required fields (App name, Email).
   - Click Save and Continue (you can skip scopes for now).
4. Go to **Credentials**.
   - Click **Create Credentials** -> **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `Supabase Auth`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `https://zbrlvkmkkopwlyppzglw.supabase.co`  (Your Supabase Project URL)
   - **Authorized redirect URIs**:
     - `https://zbrlvkmkkopwlyppzglw.supabase.co/auth/v1/callback`
   - Click **Create**.
5. Copy the **Client ID** and **Client Secret**.

## Step 2: Configure Supabase
1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard/project/zbrlvkmkkopwlyppzglw).
2. Navigate to **Authentication > Providers**.
3. Select **Google**.
4. Paste the **Client ID** and **Client Secret** from Step 1.
5. Toggle **Enable Sign in with Google** to ON.
6. Click **Save**.

## Step 3: Verify Redirect URL
1. In Supabase Dashboard, go to **Authentication > URL Configuration**.
2. Ensure `http://localhost:5173/` is listed in the **Site URL** or **Redirect URLs** whitelist.

## Done!
Once saved, restart your app login flow. The generic "AuthApiError: Service not enabled" error should disappear.
