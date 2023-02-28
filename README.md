# Using ChatGPT to Cheat Quizzes
#### Video Demo:  https://youtu.be/8kCFFvqXnEg
#### Description: Use your OpenAI API keys to help you win in online quizzes. 

## How to use
- Create OpenAI API keys by creating an account and generating API keys using this link https://platform.openai.com/account/api-keys
- Clone this repository anywhere on your computer
- Open your chromium browser and navigate to extension settings
- Enable developer mode options and click on "Load unpacked"
- Open the folder of the repository that you just cloned
- Enable the extension
- Enter your API key from OpenAI in the prompt window
- To test, try this free quiz from myQuiz https://play.myquiz.org/p/00755873

## Development Process
- To manipulate the DOM I intially thought I could run a JavaScript program on the same browser and somehow get HTML elements from another tab to retrieve the answer.
- I quickly realised I needed to use a chrome extension to manipulate the DOM properly

## Creating the Chrome Extension
- All chrome extension use a `manifest.json` file which displays all the configuration used for the extension.
- In this file I had to explain what permission it needed. The only permission it need was to run a javascript "Content Script" where I would manipulate the DOM and retrieve as much information as possible to answer the question properly.
- I could also specify on what URL this extension is to be used which as a bonus avoiding unwanted usage.

```
"content_scripts": [
        {
            "js": ["scripts/content.js"],
            "matches": ["https://play.myquiz.org/p/*"]
        }
    ]
```

## Prompting for API keys
I used a `setInterval()` function to continually prompt the user to provide OpenAI API keys to then store into `localstorage`. Storing the keys into local storage allowed the user to not have to repeatedly enter in the keys after exiting the browser.

## Manipulating the DOM
In order to formulate a prompt, I used JavaScript's classic `document.getElementById` and `document.getElementsByClassName()` to retrieve the question, category and the choices. I used template literals to combine all of these into a prompt, ready to send to the OpenAI model.

## Creating the Prompt
I needed the response from the model to be the answer and only the answer. This is what I formulated:

```
Category: Science!
Question: CHEMISTRY: What is the chemical symbol for gold?

Gd
Gl
Au
Ag

Answer:
```

The response here would be "Au". 

## Sending the request
Looking at the OpenAI API documentation I knew I could easily use JavaScript's inbuilt `fetch()` function to send an API request. 

```
const body = {
        model: "text-davinci-003",
        prompt,
        temperature: 0,
        max_tokens: 256,
      };
```

Here the model selected was the `text-davinci-003` model which is the smartest and latest model currently available. I knew I didn't need the response to be long too, so `max_tokens` was set to 256 as recommended by OpenAI.

```
const answer = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("chatgpt_key")}`,
        },
        body: JSON.stringify(body),
      });
```

Above is the JavaScipt request made to retrieve a response from OpenAI.

## Clicking on the answer

Fortunately, by using the carefully formulated prompt, the model rarely responds with anything but one of the choices.
I used javascript's `include()` function to check if any of the choices are included into the response. If so, `click()`.

I had to account for upper and lowercase letters by comparing both the choice and the response in their lowercase text. Additionally I trimmed any whitespace that might of been included in either the response or the choice by using `trim()`.

## When to send the request
This was fairly tricky because, when the next question appeared, the page doesn't reload. What I did was:
- Use the `window.onload()` function to wait until the window had loaded.
- Create a `MutationObserver` object which could be used to wait for another event to happen.
- Specify to the `MutationObserver` object what elements to watch and what function to run, when something changes.
- Inside that function, enclose everything into an `if` statement checking if the "Next question after:" HTML element is `display: none`.

## Troubleshooting
- If it's not working, try refreshing the page.

