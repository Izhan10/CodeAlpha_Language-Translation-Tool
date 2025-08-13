const API_KEY = "4iCmFjin88L46xiLsw0XDOSHVIMIxrypOsRZSwfsPZGedMx97dZuJQQJ99BHACqBBLyXJ3w3AAAbACOGh21j";
const ENDPOINT = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0";
const REGION = "southeastasia";

document.addEventListener("DOMContentLoaded", () => {
    const translateButton = document.querySelector(".translate-button");
    const copyButton = document.querySelector(".copy-button");
    const inputText = document.querySelector(".text-input");
    const outputText = document.querySelector(".text-output");
    const charCountInput = document.querySelectorAll(".character-count")[0];
    const charCountOutput = document.querySelectorAll(".character-count")[1];
    const sourceLangSelect = document.querySelectorAll(".language-select")[0];
    const targetLangSelect = document.querySelectorAll(".language-select")[1];

    inputText.addEventListener("input", () => {
        charCountInput.textContent = `${inputText.value.length} characters`;
    });

    copyButton.addEventListener("click", () => {
        const textToCopy = outputText.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Copied to clipboard!");
        });
    });

    translateButton.addEventListener("click", async () => {
        const text = inputText.value.trim();
        const selectedSourceLang = sourceLangSelect.value;
        const targetLang = targetLangSelect.value;

        if (!text) {
            alert("Please enter text to translate.");
            return;
        }

        try {
            translateButton.disabled = true;
            translateButton.textContent = "Checking language...";

            const detectResponse = await fetch(`${ENDPOINT}&to=${targetLang}`, {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": API_KEY,
                    "Ocp-Apim-Subscription-Region": REGION,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{ Text: text }])
            });

            const detectData = await detectResponse.json();
            const detectedLangCode = detectData[0]?.detectedLanguage?.language;

            if (!detectedLangCode) {
                alert("Could not detect language. Please try again.");
                translateButton.disabled = false;
                translateButton.textContent = "Translate";
                return;
            }

            if (detectedLangCode !== selectedSourceLang) {
                alert(`Language mismatch! You selected "${selectedSourceLang}", but the text seems to be "${detectedLangCode}".`);
                translateButton.disabled = false;
                translateButton.textContent = "Translate";
                return;
            }

            translateButton.textContent = "Translating...";
            const translateResponse = await fetch(`${ENDPOINT}&from=${selectedSourceLang}&to=${targetLang}`, {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": API_KEY,
                    "Ocp-Apim-Subscription-Region": REGION,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify([{ Text: text }])
            });

            const translateData = await translateResponse.json();

            if (translateData && translateData[0]?.translations?.length > 0) {
                const translatedText = translateData[0].translations[0].text;
                outputText.innerHTML = translatedText;
                charCountOutput.textContent = `${translatedText.length} characters`;
            } else {
                outputText.innerHTML = "Translation failed. Please try again.";
            }

        } catch (error) {
            console.error("Error:", error);
            outputText.innerHTML = "Error occurred while translating.";
        } finally {
            translateButton.disabled = false;
            translateButton.textContent = "Translate";
        }
    });
});
