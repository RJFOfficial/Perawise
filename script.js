const menuBtn = document.getElementById('menuBtn');
const navMenu = document.getElementById('navMenu');
const themeBtn = document.getElementById('themeBtn');


const todayDisplay = document.getElementById('todayDisplay');
const goalDisplay = document.getElementById('goalDisplay');
const totalDisplay = document.getElementById('totalDisplay');
const categoryTotals = document.getElementById('categoryTotals');
const progressBar = document.getElementById('progressBar');
const goalMessage = document.getElementById('goalMessage');
const goalForm = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');


const sessionForm = document.getElementById('sessionForm');
const sessionTopic = document.getElementById('sessionTopic');
const sessionMinutes = document.getElementById('sessionMinutes');
const sessionCategory = document.getElementById('sessionCategory');
const sessionDate = document.getElementById('sessionDate');
const sessionSubmit = document.getElementById('sessionSubmit');
const cancelEdit = document.getElementById('cancelEdit');
const sessionError = document.getElementById('sessionError');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const exportBtn = document.getElementById('exportBtn');
const clearAll = document.getElementById('clearAll');
const sessionList = document.getElementById('sessionList');


const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');
const formSuccess = document.getElementById('formSuccess');


// data
const categories = ['Programming', 'Math', 'Reading', 'Projects', 'Others'];
let goal = Number(localStorage.getItem('studylog-goal')) || 0;
let sessions = JSON.parse(localStorage.getItem('studylog-sessions')) || [];
let editingId = null;   // id of the session being edited (null = adding new)


function saveData() {
  localStorage.setItem('studylog-goal', goal);
  localStorage.setItem('studylog-sessions', JSON.stringify(sessions));
}


// 90 - 1 hr 30 mins
function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return m + 'm';
  return m === 0 ? h + 'h' : h + 'h ' + m + 'm';
}


// y m d
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}


function formatDate(value) {
  return new Date(value + 'T00:00:00').toLocaleDateString('en-PH');
}


function sumMinutes(list) {
  return list.reduce(function (sum, s) { return sum + s.minutes; }, 0);
}


// summary update
function updateSummary() {
  const today = sumMinutes(sessions.filter(function (s) { return s.date === todayISO(); }));
  const percent = goal > 0 ? Math.min((today / goal) * 100, 100) : 0;


  todayDisplay.textContent = formatTime(today);
  goalDisplay.textContent = formatTime(goal);
  totalDisplay.textContent = formatTime(sumMinutes(sessions));


  // Total minutes
  categoryTotals.innerHTML = '';
  categories.forEach(function (cat) {
    const total = sumMinutes(sessions.filter(function (s) { return s.category === cat; }));
    const chip = document.createElement('div');
    chip.className = 'cat-chip';
    const label = document.createElement('span');
    label.textContent = cat;
    const value = document.createElement('strong');
    value.textContent = formatTime(total);
    chip.append(label, value);
    categoryTotals.appendChild(chip);
  });


  progressBar.style.width = percent + '%';
  progressBar.classList.remove('warning', 'done');


  if (goal === 0) {
    goalMessage.textContent = 'Set a daily goal to start tracking your progress.';
  } else if (today >= goal) {
    progressBar.classList.add('done');
    goalMessage.textContent = 'Goal reached! Great job today.';
  } else if (percent >= 50) {
    progressBar.classList.add('warning');
    goalMessage.textContent = 'Almost there! ' + formatTime(goal - today) + ' to go.';
  } else {
    goalMessage.textContent = 'Keep going. ' + formatTime(goal - today) + ' left for today.';
  }
}


// show
function renderSessions() {
  const selected = filterCategory.value;
  const visible = sessions.filter(function (s) {
    return selected === 'All' || s.category === selected;
  });


  if (sortBy.value === 'most') {
    visible.sort(function (a, b) { return b.minutes - a.minutes; });
  } else if (sortBy.value === 'least') {
    visible.sort(function (a, b) { return a.minutes - b.minutes; });
  }


  sessionList.innerHTML = '';


  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No study sessions to show yet.';
    sessionList.appendChild(empty);
    return;
  }


  visible.forEach(function (s) {
    const li = document.createElement('li');
    li.className = 'session-item';


    const info = document.createElement('div');
    info.className = 'session-info';
    const title = document.createElement('strong');
    title.textContent = s.topic;          // textContent is safe from XSS
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = s.category + ' • ' + formatDate(s.date);
    info.append(title, meta);


    const time = document.createElement('span');
    time.className = 'session-time';
    time.textContent = formatTime(s.minutes);


    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.dataset.id = s.id;
    editBtn.textContent = 'Edit';


    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.id = s.id;
    deleteBtn.textContent = 'Delete';


    li.append(info, time, editBtn, deleteBtn);
    sessionList.appendChild(li);
  });
}


// save goal
goalForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const value = parseInt(goalInput.value, 10);


  if (isNaN(value) || value < 5) {
    alert('Please enter a goal of at least 5 minutes.');
    return;
  }
  goal = value;
  saveData();
  updateSummary();
  goalForm.reset();
});


// add or edit
function startEditing(id) {
  const s = sessions.find(function (item) { return item.id === id; });
  if (!s) return;
  editingId = id;
  sessionTopic.value = s.topic;
  sessionMinutes.value = s.minutes;
  sessionCategory.value = s.category;
  sessionDate.value = s.date;
  sessionSubmit.textContent = 'Update';
  cancelEdit.hidden = false;
  sessionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  sessionTopic.focus();
}


function stopEditing() {
  editingId = null;
  sessionForm.reset();
  sessionDate.value = todayISO();
  sessionSubmit.textContent = 'Add';
  cancelEdit.hidden = true;
  sessionError.textContent = '';
}


cancelEdit.addEventListener('click', stopEditing);


sessionForm.addEventListener('submit', function (event) {
  event.preventDefault();


  const topic = sessionTopic.value.trim();
  const minutes = parseInt(sessionMinutes.value, 10);
  const category = sessionCategory.value;
  const date = sessionDate.value;


  if (topic === '' || isNaN(minutes) || minutes < 1 || date === '') {
    sessionError.textContent = 'Enter a topic, at least 1 minute, and a date.';
    return;
  }
  sessionError.textContent = '';


  if (editingId !== null) {
    const s = sessions.find(function (item) { return item.id === editingId; });
    s.topic = topic;
    s.minutes = minutes;
    s.category = category;
    s.date = date;
  } else {
    sessions.unshift({ id: Date.now(), topic: topic, minutes: minutes, category: category, date: date });
  }


  saveData();
  renderSessions();
  updateSummary();
  stopEditing();
});


// ===== 7. csv edit
sessionList.addEventListener('click', function (event) {
  const id = Number(event.target.dataset.id);


  if (event.target.classList.contains('delete-btn')) {
    sessions = sessions.filter(function (s) { return s.id !== id; });
    if (id === editingId) stopEditing();
    saveData();
    renderSessions();
    updateSummary();
  } else if (event.target.classList.contains('edit-btn')) {
    startEditing(id);
  }
});


filterCategory.addEventListener('change', renderSessions);
sortBy.addEventListener('change', renderSessions);


clearAll.addEventListener('click', function () {
  if (sessions.length === 0) {
    alert('There are no sessions to clear.');
    return;
  }
  if (confirm('Are you sure you want to delete ALL study sessions? This cannot be undone.')) {
    sessions = [];
    stopEditing();
    saveData();
    renderSessions();
    updateSummary();
  }
});


// CSV
function csvCell(value) {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}


exportBtn.addEventListener('click', function () {
  if (sessions.length === 0) {
    alert('There are no sessions to download yet.');
    return;
  }
  const rows = [['Date', 'Topic', 'Subject', 'Minutes']];
  sessions.forEach(function (s) {
    rows.push([s.date, s.topic, s.category, s.minutes]);
  });
  const csv = rows.map(function (row) { return row.map(csvCell).join(','); }).join('\r\n');


  // The \ufeff mark helps Excel read the file as UTF-8
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'studylog-sessions.csv';
  link.click();
  URL.revokeObjectURL(link.href);
});


// contact
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


contactForm.addEventListener('submit', function (event) {
  event.preventDefault();


  const name = contactName.value.trim();
  const email = contactEmail.value.trim();
  const message = contactMessage.value.trim();
  let isValid = true;


  nameError.textContent = '';
  emailError.textContent = '';
  messageError.textContent = '';
  formSuccess.textContent = '';


  if (name.length < 2) { nameError.textContent = 'Please enter your name (at least 2 letters).'; isValid = false; }
  if (!isValidEmail(email)) { emailError.textContent = 'Please enter a valid email address.'; isValid = false; }
  if (message.length < 10) { messageError.textContent = 'Your message should be at least 10 characters.'; isValid = false; }


  if (isValid) {
    formSuccess.textContent = `Thank you, ${name}! Your message has been received.`;
    contactForm.reset();
  }
});


// mobile at dark mode
menuBtn.addEventListener('click', function () {
  navMenu.classList.toggle('open');
});


navMenu.addEventListener('click', function (event) {
  if (event.target.tagName === 'A') navMenu.classList.remove('open');
});


function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  themeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
}


themeBtn.addEventListener('click', function () {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  localStorage.setItem('studylog-theme', isDark ? 'dark' : 'light');
});


// app starter
applyTheme(localStorage.getItem('studylog-theme') === 'dark');
document.getElementById('year').textContent = new Date().getFullYear();
sessionDate.value = todayISO();
updateSummary();
renderSessions();