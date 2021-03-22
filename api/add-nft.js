const firebase = require('firebase/app')
require('firebase/firestore')

const firebaseConfig = {
    apiKey: process.env.FB_APP_API_KEY,
    authDomain: process.env.FB_APP_AUTH_DOMAIN,
    projectId: process.env.FB_APP_PROJECT_ID,
    storageBucket: process.env.FB_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_APP_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID
}

firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()

module.exports = async (req, res) => {
    const { query: { data } } = req
    var nft = JSON.parse(data)
    nft.timestamp = firebase.firestore.FieldValue.serverTimestamp()
    db.collection('nfts').doc().set(nft)
        .then(() => {
            res.json({success: true, timestamp: Date.now()})
        })
        .catch(() => {
            res.json({error: 'Bad Request', timestamp: Date.now()})
        })
}