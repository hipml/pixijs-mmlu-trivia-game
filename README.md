# Quiz Game

An adaptive quiz game powered by the HuggingFace MMLU dataset, featuring intelligent category selection and progress tracking.

## Features

- Questions from the [HuggingFace MMLU dataset](https://huggingface.co/datasets/cais/mmlu) with:
  - 20 diverse categories
  - 25 questions per category
  - Full LaTeX support for mathematical expressions
- Adaptive difficulty using Thompson sampling with beta distribution
- User profiles with detailed category progress tracking
- Interactive sound effects for enhanced engagement

## Screenshots

![User profile - all topics](public/img1.png)
![User profile - one topic](public/img2.png)
![Select topics](public/img3.png)
![Sample question](public/img4.png)


## How to Play

[Play now on Vercel!](https://vercel.com/paul-lamberts-projects/pixijs-mmlu-trivia-game)

1. Create an account or log in
2. Select a category or let the system recommend one based on your progress
3. Answer questions and track your improvement
4. Use `testaccount` to explore the interface with pre-populated data


### Launch locally

```bash
# Clone the repository
git clone https://github.com/hipml/quiz-game.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

## License

MIT License

Copyright (c) 2025 Paul M Lambert

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
