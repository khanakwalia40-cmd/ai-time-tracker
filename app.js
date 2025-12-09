// Get Firebase objects from window
const {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  doc,
  setDoc,
  getDoc,
  updateDoc
} = window._firebase;

// DOM elements
const authSection = document.getElementById("auth-section");
const mainSection = document.getElementById("main-section");
const userEmailEl = document.getElementById("user-email");
const authMessage = document.getElementById("auth-message");

const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
const googleBtn = document.getElementById("google-btn");
const logoutBtn = document.getElementById("logout-btn");

const dateInput = document.getElementById("date-input");
const remainingMinutesEl = document.getElementById("remaining-minutes");
const activityName = document.getElementById("activity-name");
const activityCategory = document.getElementById("activity-category");
const activityDuration = document.getElementById("activity-duration");
const addActivityBtn = document.getElementById("add-activity-btn");
const activityTbody = document.getElementById("activity-tbody");

const analyseBtn = document.getElementById("analyse-btn");
const dashboardContent = document.getElementById("dashboard-content");

let currentUser = null;
let activities = []; // local cache for selected date

// Helpers
function showMessage(msg, isError = false) {
  authMessage.textContent = msg;
  authMessage.style.color = isError ? "#fca5a5" : "#93c5fd";
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// AUTH ----------------------------------------------------------------
registerBtn.addEventListener("click", async () => {
  const email = regEmail.value.trim();
  const pass = regPassword.value.trim();
  if (!email || !pass) {
    showMessage("Enter email and password", true);
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    showMessage("Account created. You are logged in.");
  } catch (err) {
    showMessage(err.message, true);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const pass = loginPassword.value.trim();
  if (!email || !pass) {
    showMessage("Enter email and password", true);
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showMessage("Logged in successfully.");
  } catch (err) {
    showMessage(err.message, true);
  }
});

googleBtn.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    showMessage("Logged in with Google.");
  } catch (err) {
    showMessage(err.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// Listen to auth state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    authSection.classList.add("hidden");
    mainSection.classList.remove("hidden");
    userEmailEl.textContent = user.email || "";
    if (!dateInput.value) {
      dateInput.value = todayISO();
    }
    loadActivitiesForSelectedDate();
  } else {
    authSection.classList.remove("hidden");
    mainSection.classList.add("hidden");
    activities = [];
    renderActivities();
    dashboardContent.innerHTML = "";
  }
});

// DATA PATH HELPER ---------------------------------------------------
function dayDocRef(userId, dateStr) {
  return doc(db, "users", userId, "days", dateStr);
}

// LOAD ACTIVITIES ----------------------------------------------------
async function loadActivitiesForSelectedDate() {
  if (!currentUser) return;
  const dateStr = dateInput.value;
  if (!dateStr) return;
  try {
    const ref = dayDocRef(currentUser.uid, dateStr);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      activities = data.activities || [];
    } else {
      activities = [];
    }
    renderActivities();
  } catch (err) {
    console.error(err);
  }
}

// RENDER ACTIVITIES TABLE + REMAINING -------------------------------
function renderActivities() {
  activityTbody.innerHTML = "";
  let total = 0;

  activities.forEach((act, index) => {
    total += Number(act.duration || 0);
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.textContent = act.name;
    const catTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = act.category || "Uncategorized";
    catTd.appendChild(badge);

    const durTd = document.createElement("td");
    durTd.textContent = act.duration + " min";

    const actionTd = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginRight = "6px";
    editBtn.addEventListener("click", () => editActivity(index));
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.classList.add("danger");
    delBtn.addEventListener("click", () => deleteActivity(index));
    actionTd.appendChild(editBtn);
    actionTd.appendChild(delBtn);

    tr.appendChild(nameTd);
    tr.appendChild(catTd);
    tr.appendChild(durTd);
    tr.appendChild(actionTd);
    activityTbody.appendChild(tr);
  });

  const remaining = 1440 - total;
  remainingMinutesEl.textContent = remaining;
  remainingMinutesEl.style.color = remaining < 0 ? "#f97316" : "#22c55e";
}

// ADD / EDIT / DELETE ACTIVITIES ------------------------------------
addActivityBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const dateStr = dateInput.value;
  const name = activityName.value.trim();
  const category = activityCategory.value.trim() || "Other";
  const duration = Number(activityDuration.value);

  if (!dateStr) {
    alert("Please select a date");
    return;
  }
  if (!name || !duration || duration <= 0) {
    alert("Enter a valid activity name and duration");
    return;
  }

  const currentTotal = activities.reduce((sum, a) => sum + Number(a.duration), 0);
  if (currentTotal + duration > 1440) {
    alert("Total minutes for this day cannot exceed 1440.");
    return;
  }

  const newActivity = {
    id: Date.now(),
    name,
    category,
    duration
  };

  activities.push(newActivity);
  await saveActivities(dateStr);
  activityName.value = "";
  activityCategory.value = "";
  activityDuration.value = "";
});

async function saveActivities(dateStr) {
  if (!currentUser) return;
  try {
    const ref = dayDocRef(currentUser.uid, dateStr);
    await setDoc(ref, { activities }, { merge: true });
    renderActivities();
  } catch (err) {
    console.error(err);
  }
}

function editActivity(index) {
  const act = activities[index];
  const newName = prompt("Edit activity name", act.name);
  if (newName === null) return;

  const newCategory = prompt("Edit category", act.category);
  if (newCategory === null) return;

  const newDurationStr = prompt("Edit duration (minutes)", act.duration);
  if (newDurationStr === null) return;
  const newDuration = Number(newDurationStr);
  if (!newDuration || newDuration <= 0) {
    alert("Invalid duration");
    return;
  }

  const totalWithout = activities.reduce((sum, a, i) => i === index ? sum : sum + Number(a.duration), 0);
  if (totalWithout + newDuration > 1440) {
    alert("Total minutes cannot exceed 1440.");
    return;
  }

  activities[index] = {
    ...act,
    name: newName.trim(),
    category: newCategory.trim() || "Other",
    duration: newDuration
  };

  saveActivities(dateInput.value);
}

function deleteActivity(index) {
  if (!confirm("Delete this activity?")) return;
  activities.splice(index, 1);
  saveActivities(dateInput.value);
}

// Change date -> reload
dateInput.addEventListener("change", loadActivitiesForSelectedDate);

// ANALYTICS ----------------------------------------------------------
analyseBtn.addEventListener("click", () => {
  const total = activities.reduce((sum, a) => sum + Number(a.duration), 0);
  if (total <= 0) {
    renderNoData();
    return;
  }
  renderDashboard();
});

function renderNoData() {
  dashboardContent.innerHTML = `
    <div class="no-data">
      <div class="no-data-emoji">🕒</div>
      <div class="no-data-text">No data available for this date</div>
      <div class="no-data-cta">Start logging your day now to see insights about how you spend your 24 hours.</div>
    </div>
  `;
}

function renderDashboard() {
  const totalMinutes = activities.reduce((sum, a) => sum + Number(a.duration), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const count = activities.length;

  const perCategory = {};
  activities.forEach((a) => {
    const cat = a.category || "Other";
    perCategory[cat] = (perCategory[cat] || 0) + Number(a.duration);
  });

  const categoryItems = Object.entries(perCategory)
    .map(([cat, mins]) => {
      const pct = ((mins / totalMinutes) * 100).toFixed(1);
      return `<li><span>${cat}</span><span>${mins} min • ${pct}%</span></li>`;
    })
    .join("");

  const timelineItems = activities
    .map((a) => `<li>${a.name} — ${a.duration} min (${a.category})</li>`)
    .join("");

  dashboardContent.innerHTML = `
    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-label">Total time logged</div>
        <div class="stat-value">${totalHours} h (${totalMinutes} min)</div>
        <div class="stat-label">Number of activities: ${count}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Time per category</div>
        <ul class="category-list">
          ${categoryItems}
        </ul>
      </div>
      <div class="stat-card" style="grid-column: 1 / -1;">
        <div class="stat-label">Timeline overview</div>
        <ul class="category-list">
          ${timelineItems}
        </ul>
      </div>
    </div>
  `;
}
