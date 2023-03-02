// Add styles to page
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

// Get question
let question = document.getElementById("questionDetails__Text");

// Get next question trigger
let nextQuestionHTML = document.getElementById("timeInfo__NextQuestionAfter");

// Get quiz category/theme
let quizTheme = document
    .querySelector(".gameStateLine__Theme")
    .textContent.split(":")[0];

// Get question choices as array
let choicesHTML = document.getElementsByClassName("answerButton__TextSpan");

// Insert empty output element onto page for display
let badge = document.createElement("p");
badge.setAttribute("id", "myquiz_answer");
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
                messages: [{ role: "user", content: prompt }],
                temperature: 0,
            };

            try {
                const answer = await fetch(
                    "https://api.openai.com/v1/chat/completions",
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
                const data = await answer.json();

                // If error, display error message
                if (data.error) throw new Error(data.error.message);

                // Grab and display response
                const response = data.choices[0].message["content"];
                badge.textContent = response;

                // Click on choice if included in response
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

                // Log the prompt and response for people who are curious
                console.log(
                    `%c${prompt} ${response}`,
                    "color : teal; font-weight: bold"
                );
            } catch (error) {
                badge.innerHTML = `<p style='color:red;'>${error}</p>`;
                localStorage.setItem("chatgpt_key", "");
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
