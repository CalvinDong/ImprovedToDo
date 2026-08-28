## theweek.today
A To Do App based on Microsoft's To Do and adding more features since Microsoft has seemingly stopped feature development of the app

I personally like the idea of setting tasks for the day or week and not needing to micromanage every minute of the day like other to do apps
Ideally the app sets tasks for the week, lets you see these tasks and lets you choose which one you want to work on today.
# The Day
A To Do App based on Microsoft's To Do and adding more features since Microsoft has seemingly stopped feature development of the app

I personally like the idea of setting tasks for the day or week and not needing to micromanage every minute of the day like other to do apps

This will be a webapp with plans for conversion to phone/desktop app and will use the following tech stack

**Frontend**
- Vite
- React Typescript
- Yarn
- Tailwind
- Daisy UI

**Backend**
- ASP.NET Core 9
- ASP.NET Identity
- OppenIddict
- Postgres SQL DB
- SQLite (For local storage in app)

**Hosting**
- Azure App Service (Backend)
- Vercel (Frontend)

## Environment configuration

### Local development

The frontend and API use HTTPS locally so the complete authentication flow can
be tested. Generate and trust the shared development certificate once:

```bash
mkdir -p ~/.aspnet/https
dotnet dev-certs https --trust \
  -ep ~/.aspnet/https/improvedtodo.pem \
  --format PEM --no-password
```

The Vite certificate paths default to the files above. Override them when
needed with `DEV_HTTPS_CERT` and `DEV_HTTPS_KEY`. Copy the API development
settings example to `appsettings.Development.json`, add the local database
password, then start the applications with:

```bash
dotnet run --project apps/api/ImprovedToDo.Api --launch-profile https
npm run dev --workspace apps/web
```

The local URLs are `https://localhost:7170` for the API and
`https://localhost:5173` for the frontend.

### Production

Vite only uses certificate files for its development server. `vite build`
produces static assets without reading a certificate; Vercel terminates HTTPS
for the frontend and Azure App Service terminates HTTPS for the API.

Configure these Vercel environment variables before building the frontend:

```text
VITE_API_URL=https://api.example.com
VITE_CLIENT_ID=react-client
VITE_SPA_URL=https://app.example.com
```

Configure the matching Azure App Service settings for the API:

```text
ApplicationUrls__Api=https://api.example.com
ApplicationUrls__Spa=https://app.example.com
```

The API uses these values for CORS and for the OpenIddict redirect and logout
URI registrations. Replace the example domains with the actual deployment
domains. Configure the database connection separately as
`ConnectionStrings__DefaultConnection`; do not commit it.
