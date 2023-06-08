const fetch = require("node-fetch")

module.exports = async (data, fcm_token, notification) => {

    const response = await fetch(process.env.FCM_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(
            {
                to: fcm_token,
                data: data,
                android: {
                    priority: "high"
                },
                apns: {
                    headers: {
                        "apns-priority": 10
                    }
                },
                notification: notification
            }),
        headers: {
            'Content-type': 'application/json',
            'Authorization': process.env.AUTHORIZATION_KEY
        }
    });
    const dataFromResp = await response.json();

    if (dataFromResp.failure > 0) {
        console.log('ERROR', dataFromResp.results[0].error);
    }
    else {
        console.log("successful send push");
    }
}