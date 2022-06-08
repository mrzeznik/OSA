"use strict";

const BASE_MINUTE_MULTIPLIER_MS = 1000 * 60;
const MAX_INTERVAL_MIN = 140;
const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = MAX_INTERVAL_MIN * BASE_MINUTE_MULTIPLIER_MS;
const NOTIFICATION_DELIMITER = '\n';
const notificationTitle = 'OSA';
const notificationsElement = document.getElementById('notificationText');
const intervalElement = document.getElementById('interval');
const controlElement = document.getElementById('controlButton');
const intervalOutput = document.getElementById('intervalOutput');
const autostartElement = document.getElementById('autostart');
var timers = [];
var delayed = [];

let defaultInterval = window.localStorage.getItem('osa-interval') ?? 20;
let defaultBody = JSON.parse(window.localStorage.getItem('osa-text')) ?? 'Take a short break!';
let defaultStart = JSON.parse(window.localStorage.getItem('osa-autostart')) ?? false;

intervalElement.max = MAX_INTERVAL_MIN;
intervalElement.value = defaultInterval;
notificationsElement.value = defaultBody;
intervalOutput.innerHTML = intervalElement.value;
autostartElement.checked = defaultStart;

if (defaultStart === true) {
    startNotifications();
    controlElement.value = 'Stop';
}

function startNotifications() {
    Notification.requestPermission().then((permission) => {
        console.log('Notification permission: ' + permission);
    });

    let interval = intervalElement.value;
    let bodyBase = notificationsElement.value
        .split(NOTIFICATION_DELIMITER)
        .map(line => { return line.trim(); })
        .filter(line => { return line !== undefined & line?.length > 0; }) ?? [];

    setMultipleNotifications(interval, bodyBase);
}

/**
 * Set multiple notifications, where every single notification will be shown with the given interval.
 * First notification will be shown after the given interval. Stores all intervals and delayed tasks in arrays.
 * @param {number} interval - single notification interval in miliseconds
 * @param {Array} notifications - array of notification bodies
 */
function setMultipleNotifications(interval, notifications) {
    if (interval < 1 || interval > MAX_INTERVAL_MIN || notifications === undefined || notifications.length < 1) return;

    let notificationCount = notifications.length;
    let notificationEffectiveInterval = interval * notificationCount * BASE_MINUTE_MULTIPLIER_MS;

    notifications.forEach((notificationText, notificationNumber) => {
        let notificationDelay = notificationNumber * interval * BASE_MINUTE_MULTIPLIER_MS;
        console.info('Add notification #' + parseInt(notificationNumber + 1) + ': "' + notificationText + '", every: ' + notificationEffectiveInterval + ' ms, initial delay: ' + notificationDelay + ' ms');

        let delay = setTimeout(() => {
            var timer = addIntervalNotification(notificationTitle, notificationText, notificationEffectiveInterval);
            timers.push(timer);
        }, notificationDelay);
        delayed.push(delay);
    });
}

/**
 * Add a new notification, that will be shown with the given interval.
 * @param {string} title - notification title
 * @param {string} body - notification body
 * @param {number} interval - notification interval in miliseconds 
 * @returns id of created interval
 */
function addIntervalNotification(title, body, interval) {
    if (interval < MIN_INTERVAL_MS) return;

    return setInterval(() => {
        new Notification(title, { body, tag: 'osa_notification' })
    }, interval);
}

/**
 * Stop all notifications, by removing all previously stored intervals and timeouts.
 */
function removeNotifications() {
    console.log('Removing existing notifications.');
    timers.forEach(function (timer) {
        clearInterval(timer);
    });
    timers = [];
    delayed.forEach(function (delay) {
        clearTimeout(delay);
    });
    delayed = [];
}

/**
 * Update notifications, by removing all previously stored notifications, and starting new ones.
 */
function updateNotifications() {
    if (controlElement.value === 'Stop') {
        console.log('Updating notifications.');
        removeNotifications();
        startNotifications();
    }
}

controlElement.addEventListener('click', event => {
    var initial = event.target.value;
    removeNotifications();

    if (initial === 'Start') {
        event.target.value = 'Stop';
        startNotifications();
    } else {
        event.target.value = 'Start';
    }
});

// Update displayed interval value in the UI during manipulation.
intervalElement.addEventListener('input', event => {
    intervalOutput.innerHTML = event.target.value;
});
// Update interval value in local storage.
intervalElement.addEventListener('change', event => {
    window.localStorage.setItem('osa-interval', event.target.value);
    updateNotifications();
});
// Setup autostart in local storage.
autostartElement.addEventListener('change', event => {
    window.localStorage.setItem('osa-autostart', event.target.checked);
});
// Update notifications value in local storage.
notificationsElement.addEventListener('change', event => {
    window.localStorage.setItem('osa-text', JSON.stringify(event.target.value));
    updateNotifications();
});