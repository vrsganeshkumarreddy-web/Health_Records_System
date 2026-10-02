const USERS_KEY = "health_users_db";
const RECORDS_KEY = "health_records_db";
const SESSION_KEY = "health_active_session";

let authMode = "login";

document.addEventListener("DOMContentLoaded", function() {
    initDefaultUsers();
    checkSession();
});

function initDefaultUsers() {
    let users = localStorage.getItem(USERS_KEY);
    if (!users) {
        let defaultUsers = [
            { name: "Dr. Smith", email: "admin@health.com", password: "admin123", role: "admin" },
            { name: "John Doe", email: "user@health.com", password: "user123", role: "patient" }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
}

function toggleAuthMode(mode) {
    authMode = mode;
    
    let tabLogin = document.getElementById("tabLogin");
    let tabSignup = document.getElementById("tabSignup");
    let signupFields = document.getElementById("signupFields");
    let roleSelection = document.getElementById("roleSelection");
    let authTitle = document.getElementById("authTitle");
    let authBtn = document.getElementById("authBtn");

    if (mode === "signup") {
        tabLogin.classList.remove("active");
        tabSignup.classList.add("active");
        signupFields.style.display = "block";
        roleSelection.style.display = "flex";
        authTitle.textContent = "Create Account";
        authBtn.textContent = "Sign Up";
    } else {
        tabLogin.classList.add("active");
        tabSignup.classList.remove("active");
        signupFields.style.display = "none";
        roleSelection.style.display = "none";
        authTitle.textContent = "Login to Health System";
        authBtn.textContent = "Login";
    }
}

function handleAuth() {
    let email = document.getElementById("authEmail").value.trim();
    let password = document.getElementById("authPassword").value.trim();
    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    if (email === "" || password === "") {
        alert("Please fill in all required fields.");
        return;
    }

    if (authMode === "signup") {
        let name = document.getElementById("authName").value.trim();
        let role = document.getElementById("authRole").value;

        if (name === "") {
            alert("Please enter your name.");
            return;
        }

        // Check if user already exists
        let userExists = users.some(function(user) {
            return user.email === email;
        });

        if (userExists) {
            alert("An account with this email already exists.");
            return;
        }

        let newUser = { name: name, email: email, password: password, role: role };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        createSession(newUser);

    } else {
        // Login check
        let validUser = users.find(function(user) {
            return user.email === email && user.password === password;
        });

        if (!validUser) {
            alert("Invalid email or password.");
            return;
        }

        createSession(validUser);
    }
}

function createSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    checkSession();
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    checkSession();
}

// Verify current login session
function checkSession() {
    let currentSession = JSON.parse(localStorage.getItem(SESSION_KEY));
    let authContainer = document.getElementById("authContainer");
    let appLayout = document.getElementById("appLayout");

    if (!currentSession) {
        authContainer.style.display = "flex";
        appLayout.style.display = "none";
    } else {
        authContainer.style.display = "none";
        appLayout.style.display = "grid";

        document.getElementById("welcomeUser").textContent = "Welcome, " + currentSession.name;
        
        let displayRole = document.getElementById("displayRole");
        let formSection = document.getElementById("formSection");
        let roleNotice = document.getElementById("roleNotice");

        if (currentSession.role === "admin") {
            displayRole.textContent = "Doctor / Admin";
            formSection.style.display = "block";
            roleNotice.textContent = "Full Access: Add & Delete Records";
        } else {
            displayRole.textContent = "Patient";
            formSection.style.display = "none";
            roleNotice.textContent = "Read-Only Access: Viewing Records Only";
        }

        renderRecords();
    }
}

function getRecords() {
    let records = localStorage.getItem(RECORDS_KEY);
    if (records) {
        return JSON.parse(records);
    } else {
        return [];
    }
}

function addRecord() {
    let name = document.getElementById("name").value.trim();
    let age = document.getElementById("age").value.trim();
    let disease = document.getElementById("disease").value.trim();
    let doctor = document.getElementById("doctor").value.trim();
    let medicine = document.getElementById("medicine").value.trim();

    if (name === "" || age === "" || disease === "") {
        alert("Please enter patient name, age, and disease.");
        return;
    }

    let records = getRecords();
    let newRecord = {
        id: Date.now(),
        name: name,
        age: age,
        disease: disease,
        doctor: doctor,
        medicine: medicine
    };

    records.push(newRecord);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));

    // Clear inputs
    document.getElementById("name").value = "";
    document.getElementById("age").value = "";
    document.getElementById("disease").value = "";
    document.getElementById("doctor").value = "";
    document.getElementById("medicine").value = "";

    renderRecords();
}

function deleteRecord(id) {
    let records = getRecords();
    let updatedRecords = records.filter(function(record) {
        return record.id !== id;
    });

    localStorage.setItem(RECORDS_KEY, JSON.stringify(updatedRecords));
    renderRecords();
}

function renderRecords() {
    let records = getRecords();
    let tableBody = document.getElementById("recordTable");
    let currentSession = JSON.parse(localStorage.getItem(SESSION_KEY));

    tableBody.innerHTML = "";

    if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No health records stored.</td></tr>';
        return;
    }

    for (let i = 0; i < records.length; i++) {
        let record = records[i];
        let row = document.createElement("tr");

        let actionCell = "";
        if (currentSession && currentSession.role === "admin") {
            actionCell = '<button class="delete-btn" onclick="deleteRecord(' + record.id + ')">Delete</button>';
        } else {
            actionCell = '<span style="color: #888888;">Restricted</span>';
        }

        row.innerHTML = 
            '<td>' + escapeHTML(record.name) + '</td>' +
            '<td>' + escapeHTML(record.age) + '</td>' +
            '<td>' + escapeHTML(record.disease) + '</td>' +
            '<td>' + escapeHTML(record.doctor) + '</td>' +
            '<td>' + escapeHTML(record.medicine) + '</td>' +
            '<td>' + actionCell + '</td>';

        tableBody.appendChild(row);
    }
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}