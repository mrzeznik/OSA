"use strict";

const BASE_MINUTE_MULTIPLIER_MS = 1000 * 60;
const MAX_INTERVAL_MIN = 140;
const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = MAX_INTERVAL_MIN * BASE_MINUTE_MULTIPLIER_MS;
const NOTIFICATION_DELIMITER = '\n';
const notificationTitle = 'OSA';
const notificationElement = document.getElementById('notificationText');
const intervalElement = document.getElementById('interval');
const controlElement = document.getElementById('controlButton');
const intervalOutput = document.getElementById('intervalOutput');
var timers = [];
var delayed = [];

let defaultInterval = window.localStorage.getItem('osa-interval') ?? 20;
let defaultBody = JSON.parse(window.localStorage.getItem('osa-text')) ?? 'Take a short break!';

intervalElement.max = MAX_INTERVAL_MIN;
intervalElement.value = defaultInterval;
notificationElement.value = defaultBody;
intervalOutput.innerHTML = intervalElement.value;

function startNotifications() {
    Notification.requestPermission().then((permission) => {
        console.log('Notification permission: ' + permission);
    });

    let interval = intervalElement.value;
    let bodyBase = notificationElement.value
        .split(NOTIFICATION_DELIMITER)
        .map(line => { return line.trim(); })
        .filter(line => { return line !== undefined & line?.length > 0; }) ?? [];

    setMultipleNotifications(interval, bodyBase);
}

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

function addIntervalNotification(title, body, interval) {
    if (interval < MIN_INTERVAL_MS) return;

    return setInterval(() => {
        new Notification(title, { body, tag: 'osa_notification' })
    }, interval);
}

function removeNotifications() {
    console.log("Removing existing notifications.");
    timers.forEach(function (timer) {
        clearInterval(timer);
    });
    timers = [];
    delayed.forEach(function (delay) {
        clearTimeout(delay);
    });
    delayed = [];
}

controlElement.addEventListener("click", event => {
    var initial = event.target.value;
    removeNotifications();

    if (initial === 'Start') {
        event.target.value = 'Stop';
        startNotifications();
    } else {
        event.target.value = 'Start';
    }
});
intervalElement.addEventListener("input", event => {
    intervalOutput.innerHTML = event.target.value;
});
intervalElement.addEventListener("change", event => {
    window.localStorage.setItem('osa-interval', intervalElement.value);
});
notificationElement.addEventListener("change", event => {
    window.localStorage.setItem('osa-text', JSON.stringify(event.target.value));
});