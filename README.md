# AI-Powered Daily Time Tracking & Analytics Dashboard

A web application that helps users log their daily activities (in minutes) and analyse how they spend their 24 hours using a clean and interactive analytics dashboard. [web:18]

## Live Demo

- Deployed Link: (https://khanakwalia40-cmd.github.io/ai-time-tracker/)

## Video Walkthrough

- Video Link: https://YOUR_VIDEO_LINK

## Features

- User authentication using Email/Password and Google sign-in (Firebase Authentication).
- Per-day activity logging with:
  - Activity name.
  - Category (Work, Study, Sleep, etc.).
  - Duration in minutes.
- Validation so that total time per day cannot exceed 1440 minutes.
- Add, edit, and delete activities for any selected date.
- Date-based analytics dashboard showing:
  - Total time logged (hours and minutes).
  - Number of activities.
  - Time spent per category with percentage share.
  - Timeline-style list of all activities.
- “No data available” screen with a clear message and call to action.
- Responsive, modern UI with cards, badges, and subtle hover effects. [web:17]

## Tech Stack

- HTML, CSS, JavaScript (Vanilla).
- Firebase Authentication.
- Firebase Firestore.
- GitHub Pages for deployment. [web:11]

## Folder Structure
├── index.html # Main HTML file, Firebase config, and script imports
├── style.css # Styling for layout, responsiveness, and dashboard UI
├── app.js # All app logic: auth, CRUD operations, analytics
└── README.md

## Firebase Configuration

This project uses Firebase for authentication and Firestore for storing per-day activity logs. [web:11]

- Authentication:
  - Enabled Email/Password sign-in.
  - Enabled Google sign-in.
- Firestore:
  - Collection structure:
    - `users/{userId}/days/{date}` (each date document stores an `activities` array).

To run this project with your own Firebase project:

1. Create a project on Firebase console. [web:11]
2. Add a Web App and copy the Firebase config. [web:11]
3. Replace the `firebaseConfig` object inside `index.html` with your own credentials.
4. Enable Authentication (Email/Password + Google) in the Firebase console. [web:7]
5. Create a Firestore database (test mode is fine for learning). [web:11]

## How to Run Locally

1. Clone the repository:
git clone https://github.com/YOUR_USERNAME/ai-time-tracker.git
cd ai-time-tracker

2. Open the project in your code editor.

3. Update the Firebase configuration inside `index.html` with your own Firebase config. [web:11]

4. Open `index.html` in the browser:
   - Either use the Live Server extension in VS Code.
   - Or open the file directly in the browser. [web:18]

5. Register a new user or log in, select a date, and start logging activities.

## Deployment (GitHub Pages)

1. Push the project to a public GitHub repository. [web:18]

2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Select:
     - Source: `main` branch.
     - Folder: `/root` (or `/` if shown as root).
   - Save and wait for GitHub Pages to generate the deployment URL. [web:18]

3. Update the **Live Demo** link in this README with your GitHub Pages URL.

## How the App Works

- After authentication, the user sees:
  - Date selector.
  - Remaining minutes for the day (starting from 1440).
  - Form to add activities (name, category, duration).
- Each activity is stored in Firestore under the currently logged-in user and selected date. [web:11]
- The remaining minutes dynamically update as activities are added/edited/deleted.
- The **Analyse** button generates an analytics dashboard for the selected date.
- If there is no data for the date, a friendly “No data available” screen is shown.

## Future Improvements

- Add charts (pie/bar) using a chart library for better visual analytics.
- Weekly and monthly summary views.
- Export data as CSV.
- Dark/light theme toggle.
- Better error handling and input validations. [web:17]

## Acknowledgements

- Firebase documentation for Authentication and Firestore. [web:11]
- General GitHub README best practices and structure references. [web:18]


