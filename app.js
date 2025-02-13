// Add at the very top of app.js
const buttonSounds = {
    click: new Audio('assets/click.mp3'),
    hover: new Audio('assets/hover.mp3'),
    success: new Audio('assets/success.mp3'),
    error: new Audio('assets/error.mp3')
};

// Set volume for each sound
buttonSounds.click.volume = 0.3;
buttonSounds.hover.volume = 0.1;
buttonSounds.success.volume = 0.4;
buttonSounds.error.volume = 0.4;

// Theme Management
document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
    updateThemeToggleIcon(theme);
    initializeSoundEffects();
    showLoadingScreen();
    
    // Simulate loading time
    setTimeout(() => {
        hideLoadingScreen();
        initializeAnimatedIcons();
        createBubbles();
    }, 2000);
});

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleIcon(newTheme);
});

function updateThemeToggleIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Navigation
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.mode-section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        
        navButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(`${mode}Section`).classList.add('active');
    });
});

// Clock Functionality
let is24HourFormat = false;
const timeFormatToggle = document.getElementById('timeFormatToggle');

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const displayHours = is24HourFormat ? hours : hours % 12 || 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    document.getElementById('hours').textContent = padNumber(displayHours);
    document.getElementById('minutes').textContent = padNumber(minutes);
    document.getElementById('seconds').textContent = padNumber(seconds);
    document.getElementById('period').textContent = is24HourFormat ? '' : period;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

timeFormatToggle.addEventListener('click', () => {
    is24HourFormat = !is24HourFormat;
    updateClock();
});

setInterval(updateClock, 1000);

// Timer Functionality
let timerInterval;
let timerRunning = false;

const startTimer = document.getElementById('startTimer');
const pauseTimer = document.getElementById('pauseTimer');
const resetTimer = document.getElementById('resetTimer');
const timerSound = document.getElementById('timerSound');

function validateTimerInput(input) {
    const value = parseInt(input.value) || 0;
    const max = parseInt(input.max);
    if (value > max) input.value = max;
    if (value < 0) input.value = 0;
    input.value = padNumber(value);
}

// Add input validation to timer inputs
document.getElementById('timerHours').addEventListener('input', function() {
    validateTimerInput(this);
});
document.getElementById('timerMinutes').addEventListener('input', function() {
    validateTimerInput(this);
});
document.getElementById('timerSeconds').addEventListener('input', function() {
    validateTimerInput(this);
});

startTimer.addEventListener('click', () => {
    if (!timerRunning) {
        const hours = parseInt(document.getElementById('timerHours').value) || 0;
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds > 0) {
            buttonSounds.success.play();
            timerRunning = true;
            timerInterval = setInterval(() => {
                totalSeconds--;
                
                if (totalSeconds <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    timerSound.play();
                }
                
                updateTimerDisplay(totalSeconds);
            }, 1000);
        } else {
            buttonSounds.error.play();
        }
    }
});

pauseTimer.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
});

resetTimer.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timerHours').value = '00';
    document.getElementById('timerMinutes').value = '00';
    document.getElementById('timerSeconds').value = '00';
});

function updateTimerDisplay(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('timerHours').value = padNumber(hours);
    document.getElementById('timerMinutes').value = padNumber(minutes);
    document.getElementById('timerSeconds').value = padNumber(seconds);
}

// Alarm Functionality
const SNOOZE_TIME = 5; // 5 minutes snooze

// Load saved alarms from localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedAlarms = JSON.parse(localStorage.getItem('alarms') || '[]');
    alarms.push(...savedAlarms);
    renderAlarms();
    checkAlarms();
});

function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

const alarms = [];
const setAlarmBtn = document.getElementById('setAlarm');
const alarmSound = document.getElementById('alarmSound');

setAlarmBtn.addEventListener('click', () => {
    const time = document.getElementById('alarmTime').value;
    const label = document.getElementById('alarmLabel').value || 'Alarm';
    
    if (time) {
        const alarm = {
            time,
            label,
            id: Date.now(),
            enabled: true
        };
        
        alarms.push(alarm);
        saveAlarms();
        renderAlarms();
        buttonSounds.success.play();
    } else {
        buttonSounds.error.play();
    }
});

function renderAlarms() {
    const alarmList = document.querySelector('.alarm-list');
    alarmList.innerHTML = alarms.map(alarm => `
        <div class="alarm-item ${alarm.enabled ? 'active' : 'disabled'}">
            <div class="alarm-info">
                <span>${alarm.label} - ${alarm.time}</span>
                <label class="switch">
                    <input type="checkbox" ${alarm.enabled ? 'checked' : ''} 
                           onchange="toggleAlarm(${alarm.id}, this.checked)">
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="alarm-controls">
                <button onclick="deleteAlarm(${alarm.id})" class="btn btn-danger btn-sm">Delete</button>
            </div>
        </div>
    `).join('');
}

function toggleAlarm(id, enabled) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        alarm.enabled = enabled;
        saveAlarms();
    }
}

function deleteAlarm(id) {
    const index = alarms.findIndex(alarm => alarm.id === id);
    if (index !== -1) {
        alarms.splice(index, 1);
        saveAlarms();
        renderAlarms();
    }
}

function showAlarmNotification(alarm) {
    const notification = document.createElement('div');
    notification.className = 'alarm-notification';
    notification.innerHTML = `
        <h3>${alarm.label}</h3>
        <div class="notification-controls">
            <button onclick="snoozeAlarm(${alarm.id})" class="btn btn-warning">Snooze (${SNOOZE_TIME}min)</button>
            <button onclick="dismissAlarm()" class="btn btn-primary">Dismiss</button>
        </div>
    `;
    document.body.appendChild(notification);
    alarmSound.play();
}

function snoozeAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        const [hours, minutes] = alarm.time.split(':');
        const alarmTime = new Date();
        alarmTime.setHours(parseInt(hours));
        alarmTime.setMinutes(parseInt(minutes) + SNOOZE_TIME);
        
        alarm.time = `${padNumber(alarmTime.getHours())}:${padNumber(alarmTime.getMinutes())}`;
        saveAlarms();
        renderAlarms();
    }
    dismissAlarm();
}

function dismissAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    document.querySelector('.alarm-notification')?.remove();
}

function checkAlarms() {
    setInterval(() => {
        const now = new Date();
        const currentTime = `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
        
        alarms.forEach(alarm => {
            if (alarm.enabled && alarm.time === currentTime && !document.querySelector('.alarm-notification')) {
                showAlarmNotification(alarm);
            }
        });
    }, 1000);
}

// Stopwatch Functionality
let stopwatchInterval;
let stopwatchRunning = false;
let stopwatchTime = 0;
const laps = [];

const startStopwatch = document.getElementById('startStopwatch');
const lapStopwatch = document.getElementById('lapStopwatch');
const resetStopwatch = document.getElementById('resetStopwatch');

startStopwatch.addEventListener('click', () => {
    if (!stopwatchRunning) {
        buttonSounds.success.play();
        stopwatchRunning = true;
        startStopwatch.textContent = 'Pause';
        stopwatchInterval = setInterval(() => {
            stopwatchTime++;
            updateStopwatchDisplay();
        }, 1000);
    } else {
        buttonSounds.click.play();
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        startStopwatch.textContent = 'Start';
    }
});

lapStopwatch.addEventListener('click', () => {
    if (stopwatchRunning) {
        buttonSounds.click.play();
        laps.push(stopwatchTime);
        renderLaps();
    }
});

resetStopwatch.addEventListener('click', () => {
    buttonSounds.error.play();
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    stopwatchTime = 0;
    laps.length = 0;
    updateStopwatchDisplay();
    renderLaps();
    startStopwatch.textContent = 'Start';
});

function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;
    
    document.getElementById('stopwatchTime').textContent = 
        `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
}

function renderLaps() {
    const lapTimesDiv = document.querySelector('.lap-times');
    lapTimesDiv.innerHTML = laps.map((time, index) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        return `<div class="lap-item">Lap ${index + 1}: ${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}</div>`;
    }).join('');
}

// Utility Functions
function padNumber(num) {
    return num.toString().padStart(2, '0');
}

// Enhanced Particle System
function createEnhancedParticles() {
    const particlesContainer = document.querySelector('.particles-background');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        particlesContainer.appendChild(particle);
    }
}

// Mouse trail effect
function createMouseTrail() {
    const trailContainer = document.createElement('div');
    trailContainer.className = 'mouse-trail';
    document.body.appendChild(trailContainer);

    const trail = [];
    const trailLength = 20;

    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        trailContainer.appendChild(dot);
        trail.push({ dot, x: 0, y: 0 });
    }

    document.addEventListener('mousemove', (e) => {
        trail.push({
            x: e.clientX,
            y: e.clientY
        });

        if (trail.length > trailLength) {
            const oldDot = trail.shift();
            oldDot.dot.remove();
        }

        trail.forEach((item, index) => {
            const scale = (trailLength - index) / trailLength;
            item.dot.style.transform = `translate(${item.x}px, ${item.y}px) scale(${scale})`;
            item.dot.style.opacity = scale;
        });
    });
}

// Custom Cursor
function createCustomCursor() {
    const cursor = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursor.className = 'cursor';
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function animate() {
        // Smooth cursor movement
        const dx = cursorX - dotX;
        const dy = cursorY - dotY;
        dotX += dx * 0.2;
        dotY += dy * 0.2;

        cursor.style.transform = `translate(${cursorX - 15}px, ${cursorY - 15}px)`;
        cursorDot.style.transform = `translate(${dotX - 4}px, ${dotY - 4}px)`;

        requestAnimationFrame(animate);
    }
    animate();

    // Cursor hover effect
    const clickableElements = document.querySelectorAll('button, .nav-btn, .time-display, input');
    clickableElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '50px';
            cursor.style.height = '50px';
            cursor.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '30px';
            cursor.style.height = '30px';
            cursor.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    });
}

// Initialize effects
document.addEventListener('DOMContentLoaded', () => {
    createEnhancedParticles();
    createMouseTrail();
    createCustomCursor();
});

// Button Sound Effects
function initializeSoundEffects() {
    const buttons = document.querySelectorAll('button, .nav-btn, .clickable');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttonSounds.click.currentTime = 0;
            buttonSounds.click.play();
        });
        
        button.addEventListener('mouseenter', () => {
            buttonSounds.hover.currentTime = 0;
            buttonSounds.hover.play();
        });
    });
}

// Add to existing JavaScript
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

// Add animated icons to navigation
function initializeAnimatedIcons() {
    const icons = {
        clock: 'icon-spin',
        timer: 'icon-pulse',
        alarm: 'icon-bounce',
        stopwatch: 'icon-spin'
    };
    
    Object.entries(icons).forEach(([mode, animation]) => {
        const button = document.querySelector(`[data-mode="${mode}"] i`);
        if (button) {
            button.classList.add(animation);
        }
    });
}

// Add to existing JavaScript
function createBubbles() {
    const container = document.querySelector('.animated-background');
    const bubbleCount = 15;

    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size and position
        const size = Math.random() * 100 + 50;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}vw`;
        bubble.style.top = `${Math.random() * 100}vh`;
        
        // Random animation delay and duration
        bubble.style.animationDelay = `${Math.random() * 8}s`;
        bubble.style.animationDuration = `${Math.random() * 4 + 6}s`;
        
        container.appendChild(bubble);
    }
}

// User Preferences
const userPreferences = {
    clockDesign: 'digital',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarmSound: 'default',
    theme: 'light'
};

// Save preferences
function savePreferences() {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
}

// Load preferences
function loadPreferences() {
    const saved = JSON.parse(localStorage.getItem('userPreferences'));
    if (saved) {
        Object.assign(userPreferences, saved);
        applyPreferences();
    }
}

// Circular Timer Implementation
function initCircularTimer() {
    const timerTemplate = document.getElementById('circularTimer');
    const timerContainer = document.querySelector('.timer-display');
    const timerClone = timerTemplate.content.cloneNode(true);
    timerContainer.appendChild(timerClone);

    const circle = document.querySelector('.timer-path-remaining');
    const circumference = 2 * Math.PI * 45; // r=45
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
}

// Weather Integration
async function getWeather() {
    try {
        const position = await getCurrentPosition();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=YOUR_API_KEY`
        );
        const data = await response.json();
        updateWeatherUI(data);
    } catch (error) {
        console.error('Weather fetch failed:', error);
    }
}

// Drag & Drop Alarms
function initDragAndDrop() {
    const alarmList = document.querySelector('.alarm-list');
    new Sortable(alarmList, {
        animation: 150,
        ghostClass: 'dragging',
        onEnd: function() {
            // Update alarm order in storage
            saveAlarms();
        }
    });
}

// Custom Alarm Sounds
document.getElementById('alarmSound').addEventListener('change', function(e) {
    if (e.target.value === 'custom') {
        document.getElementById('customAlarmSound').click();
    } else {
        userPreferences.alarmSound = e.target.value;
        savePreferences();
    }
});

// Multi-timezone Support
function populateTimezones() {
    const timezoneSelect = document.getElementById('timezone');
    Intl.supportedValuesOf('timeZone').forEach(timezone => {
        const option = new Option(timezone, timezone);
        timezoneSelect.add(option);
    });
    timezoneSelect.value = userPreferences.timezone;
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    initCircularTimer();
    initDragAndDrop();
    populateTimezones();
    getWeather();
}); 