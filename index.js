const admin = require("firebase-admin");
const cron = require('node-cron');
const axios = require('axios');
const login = require("facebook-chat-api");

// import key สำหรับเชื่อมต่อ firebase
var serviceAccount = require("./one-piece-api-firebase-adminsdk-lfvrm-1861221afe.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "*****"
});

const firebase = admin.database();

//เช็คทุกๆ 5 นาที
cron.schedule('*/5 * * * *', () => {
    console.log('checking...');
    // ดึงข้อมูลจาก api ที่ทำไว้
    axios.get('*****').then(response => {
        // เช็คข้อมูลใน firebase ว่ามีข้อมูลอยู่มั้ย อ้างอิงจาก url
        response.data.forEach((item) => {
            firebase.ref("One-piece").orderByChild('url').equalTo(item.url).on("value", snap => {
                if (!snap.exists()) {
                    // ถ้าไม่มีข้อมูลอยู่ใน firebase ให้บันทึกข้อมูล (มังงะ) ตอนนี้ไว้
                    firebase.ref("One-piece").push().set(item).then(() => {
                        // ส่วนของการส่งข้อความ
                        login({
                            // รับ email ผ่านทาง process
                            email: process.env.email,
                            // รับ รหัสผ่าน ผ่านทาง process
                            password: process.env.password
                        }, (err, api) => {
                            if (err) return console.error(err)
                            else {
                                // รับ group id ผ่านทาง process
                                const groupID = process.env.groupId;
                                // ข้อความและรูปภาพที่ใช้สำหรับส่ง
                                let msg = {
                                    body: `วันพีช ตอนล่าสุด \n (${item.title}) \n ${item.link}`,
                                    url: item.enclosures[0].url
                                };
                                api.sendMessage(msg, groupID, () => {
                                    console.log('success');
                                    // เมื่อส่งเสร็จ ทำการ logout ออก
                                    api.logout();
                                });
                            }
                        });
                    });
                }
            });
        });
    });
});