self.addEventListener('message', function (event) {
    const { title, body, icon, reminderId } = event.data;
    const options = {
        body: body,
        icon: icon,
        tag: reminderId,
        actions: [{ action: 'snooze', title: 'Snooze 10 min' }]
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    if (event.action === 'snooze') {
        event.notification.close();
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ action: 'snooze', reminderId: event.notification.tag }));
        });
    } else {
        event.notification.close();
    }
});