const input = document.getElementById("user-input");
const response = document.getElementById("ai-response");

/* OPENROUTER API KEY */

const API_KEY = "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";

let isThinking = false;

/* MEMORY */

const systemPrompt = {
  role: "system",
  content:
    "You are Alter Ego, a mysterious holographic AI with calm and intelligent responses."
};

/* LOAD SAVED MEMORY */

let conversationHistory =
  JSON.parse(localStorage.getItem("novaMemory"))
  || [systemPrompt];
/* TYPE EFFECT */

function typeText(text) {

  response.textContent = "";

  let index = 0;

  const interval = setInterval(() => {

    response.textContent += text.charAt(index);

    index++;

    if (index >= text.length) {
      clearInterval(interval);
    }

  }, 15);

}

/* HIDE RESPONSE WHEN TYPING */

input.addEventListener("input", () => {

  if (input.value.length > 0) {
    response.style.opacity = "0";
  } else {
    response.style.opacity = "1";
  }

});

/* SEND MESSAGE */

input.addEventListener("keydown", async (e) => {

  if (e.key === "Enter" && !isThinking) {

    e.preventDefault();

    const userMessage = input.value.trim();

    if (!userMessage) return;

    isThinking = true;

    input.disabled = true;

    response.style.opacity = "1";

    typeText("THINKING...");

    /* SAVE USER MESSAGE */

    conversationHistory.push({
      role: "user",
      content: userMessage
    });

localStorage.setItem(
  "alteregoMemory",
  JSON.stringify(conversationHistory)
);

    try {

      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            model: "meta-llama/llama-3-8b-instruct:free",

            messages: conversationHistory

          })

        }
      );

      const data = await res.json();

      console.log(data);

      if (data.error) {

        typeText("AI ERROR");

      } else {

        const aiText =
          data.choices?.[0]?.message?.content
          || "NO RESPONSE";

        /* SAVE AI RESPONSE */

        conversationHistory.push({
          role: "assistant",
          content: aiText
        });

localStorage.setItem(
  "alteregoMemory",
  JSON.stringify(conversationHistory)
);

        typeText(aiText);

      }

    } catch (err) {

      console.error(err);

      typeText("CONNECTION FAILED");

    }

    input.disabled = false;

    input.value = "";

    input.focus();

    isThinking = false;

  }

});