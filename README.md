

# **Workspaces Sample Application: C\# / React**

## **Overview**

The Workspaces Sample App is a Single Page Application (SPA) built with **React.js** (frontend) and **.NET 8.0 Web API** (backend). It demonstrates practical examples of building Workspaces as an in-product integration using the **Docusign C\# eSignature SDK**.

A live instance of the application is available at: https://workspaces.sampleapps.docusign.com/

---

## **Features**

This application demonstrates the following Docusign use cases:

1. **Authentication** — Authorization Code Grant (ACG)  
2. **Dynamically create transactional spaces** — Workspace creation, Workspace envelope creation, document upload request  
3. **Persistent workspaces** — Workspace lookup, envelope creation, document upload 

---

## **Prerequisites**

Before building or running the application, ensure the following are installed and configured:

| Requirement | Notes |
| ----- | ----- |
| [Node.js](https://nodejs.org/en/download) | Required to build the React frontend |
| [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) | Required to build and run the backend API |
| [Docker](https://www.docker.com/) | Required only for containerized deployment |
| Docusign Developer Account | [Sign up here](https://go.docusign.com/o/sandbox/) |

### **Docusign app setup**

1. Log in to your Docusign Developer Account and navigate to the [Apps and Keys](https://admindemo.docusign.com/authenticate?goTo=appsAndKeys) page.  
2. Create a new application and note down the **Integration Key**.  
3. Add the following **Redirect URIs** for your app:  
   * `{PROTOCOL}://{DOMAIN}`  
   * `{PROTOCOL}://{DOMAIN}/admin`  
   * `{PROTOCOL}://{DOMAIN}/api/consentcallback`  
4. Click **ADD SECRET KEY** and save the generated key — this is your `{SecretKey}`.  
5. Click **GENERATE RSA** and save both the public and private key — the private key will be stored as `private.key`.

---

## **Configuration**

### **1\. Create `appsettings.json`**

Copy the example config file and fill in your values:

```shell
cp DocuSign.Workspaces/DocuSign.Workspaces/appsettings-example.json DocuSign.Workspaces/DocuSign.Workspaces/appsettings.json
```

Edit `appsettings.json` and replace the following placeholders:

| Placeholder | Description |
| ----- | ----- |
| `{ClientAppUrl}` | URL of the React frontend (e.g. http://localhost:3000) |
| `{IntegrationKey}` | The Integration Key (GUID) from your Docusign app |
| `{SecretKey}` | The secret key generated in the Docusign Apps and Keys page |
| `{SecretKeyProd}` | Secret key for the production Docusign app — not required for local development |
| `{RedirectBaseUrl}` | Internal redirection URL used for consent and embedded signing (e.g. http://localhost:3000) |
| `{EventNotificationBaseUrl}` | Public base URL used by the Docusign Events webhook (e.g. http://localhost:5000) |
| `{AuthBasePath}` | Base authentication URL (e.g. https://account-d.docusign.com) |
| `{BaseUri}` | Base API URL for test account API calls (e.g. https://demo.docusign.net) |
| `{UserId}` | ID of the test user |
| `{AccountId}` | ID of the account connected to the test user |
| `{Login}` | Hardcoded login used in Use Case 3 (Customer Profile) |
| `{Password}` | Hardcoded password used in Use Case 3 (Customer Profile) |

### **2\. Add the RSA Private Key**

Save the RSA private key generated during Docusign app setup to:

```
sample-app-workspaces-csharp/DocuSign.Workspaces/DocuSign.Workspaces/private.key
```

---

## **Local Installation (Without Docker)**

Follow these steps to run the application locally:

### **Step 1 — Clone the Repository**

```shell
git clone https://github.com/docusign/sample-app-workspaces-csharp.git
cd sample-app-workspaces-csharp
```

### **Step 2 — Configure the Application**

Complete the **Configuration** steps above before proceeding.

### **Step 3 — Install Frontend Dependencies**

Navigate to the React client app folder and install Node packages:

```shell
cd DocuSign.Workspaces/DocuSign.Workspaces/ClientApp/
npm install
```

### **Step 4 — Start the Frontend**

```shell
npm start
```

Leave this terminal running. The React dev server will start on its default port.

### **Step 5 — Build the .NET Backend**

Open a **new terminal** and navigate to the solution root:

```shell
cd DocuSign.Workspaces
dotnet build --configuration Debug
```

### **Step 6 — Run the .NET Backend**

```shell
dotnet run --project ./DocuSign.Workspaces/DocuSign.Workspaces.csproj --configuration Debug
```

### **Step 7 — Open the App**

Open a browser and go to:

```
https://localhost:3000
```

---

## **Project Structure**

```
sample-app-workspaces-csharp/
├── .github/workflows/              # CI/CD workflows
├── DocuSign.Workspaces/            # Solution directory
│   ├── DocuSign.Workspaces/        # Main project directory
│   │   ├── ClientApp/              # React.js frontend (SPA)
│   │   ├── appsettings-example.json
│   │   ├── appsettings.json        # Your local config (not committed)
│   │   └── private.key             # Your RSA private key (not committed)
│   └── DocuSign.Workspaces.sln
├── .gitignore
├── LICENSE
├── README.md
└── package-lock.json
```

---

## **Technology Stack**

| Layer | Technology |
| ----- | ----- |
| Frontend | React.js, SCSS |
| Backend | .NET 8.0 Web API, C\# |
| Auth | Docusign JWT Grant / ACG |
| SDK | Docusign C\# eSignature SDK |
| Containerization | Docker |

---

## **Additional Resources**

* [Docusign Developer Center](https://developers.docusign.com/)  
* [JWT Grant Authentication](https://developers.docusign.com/platform/auth/jwt/)  
* [Authorization Code Grant](https://developers.docusign.com/platform/auth/authcode/)  
* [eSignature REST API Reference](https://developers.docusign.com/docs/esign-rest-api/)

---

## **License**

This project is licensed under the [MIT License](LICENSE).

