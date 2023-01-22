var styles = `
    .loader {
        border: 4px solid #f3f3f3; /* Light grey */
        border-top: 4px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
var styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

question = document.getElementById("questionDetails__Text");
badge = document.createElement("p");
badge.setAttribute("id", "myquiz_answer");

// Insert empty output element onto page for display
document
    .querySelector(".questionDetails__QuestionCol")
    .insertAdjacentElement("beforebegin", badge);

// Clicking on the question will generate some response
question.addEventListener("click", async (e) => {
    if (document.getElementById("myquiz_answer")) {
        badge.innerHTML = "<div class='loader'></div>";
    }
    loader = document.getElementsByClassName("loader");

    // Make HTTP request to ChatGPT
    const body = {
        model: "text-davinci-003",
        prompt: `${question.textContent}`,
        temperature: 0,
        max_tokens: 100,
    };
    const answer = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("chatgpt_key")}`,
        },
        body: JSON.stringify(body),
    });
    data = await answer.json();

    if (data.error) {
        badge.innerHTML = `<p style='color:red;'>${data.error.message}</p>`;
        sessionStorage.setItem("chatgpt_key", "");
    } else if (data.choices[0].text) {
        badge.textContent = data.choices[0].text;
    }
});

// Always checks that an API key is being used
setInterval(() => {
    if (!sessionStorage.getItem("chatgpt_key")) {
        let key = prompt("Please enter your ChatGPT API key", "");
        if (key) {
            sessionStorage.setItem("chatgpt_key", key);
        }
    }
}, 4000);
