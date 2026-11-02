# 🚀 LeadPilot AI
### Intelligent AI-Powered Lead Qualification & Enterprise Workflow Automation

LeadPilot AI is an AI-powered enterprise platform designed to automate customer enquiry processing, intelligent lead qualification, approval management, and customer communication. It transforms natural-language customer enquiries into structured business requirements and streamlines the entire lead-to-approval workflow.

## 🎯 Problem Statement

Businesses often handle customer enquiries, lead evaluation, approval processes, and follow-ups manually. These processes can result in delayed decisions, inconsistent lead qualification, inefficient prioritization, and poor customer communication.

LeadPilot AI addresses these challenges through AI-powered requirement extraction, automated qualification, intelligent workflow management, and transparent approval processing.

## 💡 Key Features

- **AI-Powered Requirement Extraction:** Understands customer enquiries expressed in natural language and extracts relevant business requirements.
- **BANT-Based Lead Scoring:** Evaluates leads based on Budget, Authority, Need, and Timeline.
- **Lead Validation:** Validates customer details and identifies incomplete or invalid information.
- **State-Based Service Eligibility:** Supports service availability across Karnataka and identifies enquiries outside the supported service area.
- **FIFO-Based Approval Processing:** Prioritizes eligible pending projects based on their original submission timestamps.
- **Delivery Deadline Prioritization:** Helps managers monitor approved projects according to delivery deadlines.
- **Manager Approval System:** Enables managers to approve or reject projects with recorded decision reasons.
- **Automated Customer Notifications:** Supports email and SMS notifications for approval and rejection updates.
- **Workflow Logs:** Maintains visibility into lead processing and workflow activities.
- **Centralized Dashboard:** Provides a unified view of enquiries, leads, approvals, and project progress.

## ⚙️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, JavaScript, CSS |
| Backend | Python, FastAPI |
| AI Integration | Google Gemini API |
| Database | Existing project database / SQLAlchemy |
| API Communication | REST APIs |
| Version Control | Git, GitHub |

## 🔄 Application Workflow

1. Customer submits an enquiry in natural language.
2. AI extracts the customer's requirements.
3. Backend validates the extracted information.
4. BANT scoring evaluates the lead.
5. Service-area eligibility is checked.
6. Eligible leads enter the FIFO approval queue.
7. Managers review and approve or reject projects.
8. Decision reasons are recorded.
9. Customers receive email and SMS notifications through configured providers.
10. Approved projects are monitored through delivery deadline prioritization.

## 🏗️ Project Structure

```text
LeadPilot-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md
```

*The structure above is illustrative. Actual folders and filenames may vary.*

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js and npm
- Git
- Google Gemini API key (if required by the configured AI integration)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/LeadPilot-AI.git
cd LeadPilot-AI
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure required environment variables using the project's environment configuration.

Start the backend:

```bash
uvicorn main:app --reload
```

*Adjust the import path if your FastAPI application uses a different entry point.*

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed in the terminal.

## 🔐 Environment Configuration

Create a `.env` file in the appropriate backend directory and configure the required credentials.

Example:

```env
GEMINI_API_KEY=your_api_key
DATABASE_URL=your_database_url
SMTP_HOST=your_smtp_host
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_email_password
SMS_API_KEY=your_sms_api_key
```

Only configure variables required by your implementation. Never commit actual credentials to GitHub.

## 🌟 Project Objectives

- Reduce manual lead qualification efforts.
- Improve consistency in lead evaluation.
- Automate enterprise approval workflows.
- Ensure fair and transparent approval prioritization.
- Improve customer communication and decision visibility.
- Support efficient enterprise project management.

## 🔮 Future Enhancements

- Advanced sales analytics and forecasting.
- CRM integrations.
- Enhanced notification delivery monitoring.
- Customer-facing project tracking portal.
- Advanced AI-assisted sales recommendations.

## 👩‍💻 Developed For

An enterprise workflow automation hackathon project focused on intelligent lead qualification and automated business processes.

---

**LeadPilot AI – Turning Customer Enquiries into Intelligent Business Decisions.** 🚀
