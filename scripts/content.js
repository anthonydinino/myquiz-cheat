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

let question = document.getElementById("questionDetails__Text");
let nextQuestionHTML = document.getElementById("timeInfo__NextQuestionAfter");
let quizTheme = document
    .querySelector(".gameStateLine__Theme")
    .textContent.split(":")[0];

let choicesHTML = document.getElementsByClassName("answerButton__TextSpan");

let badge = document.createElement("p");
badge.setAttribute("id", "myquiz_answer");

// Insert empty output element onto page for display
document
    .querySelector(".questionDetails__QuestionCol")
    .insertAdjacentElement("beforebegin", badge);

window.onload = () => {
    let mutationObserver = new MutationObserver(async (entities) => {
        if (nextQuestionHTML.style.display == "none") {
            if (document.getElementById("myquiz_answer")) {
                badge.innerHTML = "<div class='loader'></div>";
            }

            // Organise choices into string
            const choices = Object.values(choicesHTML)
                .map((x) => x.textContent)
                .join("\n");

            const prompt = `Category: ${quizTheme}\nQuestion: ${question.textContent}\n\n${choices}\n\nAnswer:`;

            // Make HTTP request to ChatGPT
            const body = {
                model: "gpt-3.5-turbo",
                prompt,
                temperature: 0,
                max_tokens: 256,
            };

            const answer = await fetch(
                "https://api.openai.com/v1/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(
                            "chatgpt_key"
                        )}`,
                    },
                    body: JSON.stringify(body),
                }
            );
            data = await answer.json();

            if (data.error) {
                badge.innerHTML = `<p style='color:red;'>${data.error.message}</p>`;
                localStorage.setItem("chatgpt_key", "");
            } else if (data.choices[0].text) {
                const response = data.choices[0].text;
                badge.textContent = response;
                for (const [key, value] of Object.entries(choicesHTML)) {
                    if (
                        response
                            .trim()
                            .toLowerCase()
                            .includes(value.textContent.trim().toLowerCase())
                    ) {
                        choicesHTML[key].click();
                    }
                }
            }
        }
    });
    mutationObserver.observe(question, {
        childList: true,
        characterData: true,
    });
};

// Always checks that an API key is being used
setInterval(() => {
    if (!localStorage.getItem("chatgpt_key")) {
        let key = prompt("Please enter your ChatGPT API key", "");
        if (key) {
            localStorage.setItem("chatgpt_key", key);
        }
    }
}, 4000);
