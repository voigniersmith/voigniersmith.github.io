import { Command, CommandDeps } from './types';

export function createGameCommands(deps: CommandDeps): Command[] {
  const { createOutput } = deps;

  return [
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'rps' || input.toLocaleLowerCase().trim() === 'rock-paper-scissors',
      description: "'rps' or 'rock-paper-scissors': play rock, paper, scissors against the computer",
      execute: (input, ld) => {
        ld.push(createOutput(''));
        ld.push(createOutput('Rock, Paper, Scissors!'));
        ld.push(createOutput(''));
        ld.push(createOutput('Usage: rps [rock|paper|scissors]'));
        ld.push(createOutput('Example: rps rock'));
        ld.push(createOutput(''));
        return ld;
      },
    },
    {
      match: (input) => {
        const cmd = input.toLocaleLowerCase().trim();
        return cmd.startsWith('rps ') || cmd.startsWith('rock-paper-scissors ');
      },
      description: "'rps [choice]': play rock paper scissors",
      execute: (input, ld) => {
        const choice = input.split(' ').slice(1).join(' ').toLocaleLowerCase().trim();
        const validChoices = ['rock', 'paper', 'scissors'];

        if (!validChoices.includes(choice)) {
          ld.push(createOutput(`invalid choice: ${choice}`));
          ld.push(createOutput('valid choices: rock, paper, scissors'));
          return ld;
        }

        const choices = ['rock', 'paper', 'scissors'];
        const computerChoice = choices[Math.floor(Math.random() * choices.length)];

        ld.push(createOutput(''));
        ld.push(createOutput(`you chose: ${choice}`));
        ld.push(createOutput(`computer chose: ${computerChoice}`));
        ld.push(createOutput(''));

        if (choice === computerChoice) {
          ld.push(createOutput('tie!'));
        } else if (
          (choice === 'rock' && computerChoice === 'scissors') ||
          (choice === 'paper' && computerChoice === 'rock') ||
          (choice === 'scissors' && computerChoice === 'paper')
        ) {
          ld.push(createOutput('you win!'));
        } else {
          ld.push(createOutput('you lose!'));
        }
        ld.push(createOutput(''));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'flip' || input.toLocaleLowerCase().trim() === 'coin-flip',
      description: "'flip' or 'coin-flip': flip a coin",
      execute: (input, ld) => {
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        ld.push(createOutput(''));
        ld.push(createOutput(`you flipped: ${result}`));
        ld.push(createOutput(''));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'dice' || input.toLocaleLowerCase().trim() === 'roll',
      description: "'dice' or 'roll': roll a 6-sided die",
      execute: (input, ld) => {
        const result = Math.floor(Math.random() * 6) + 1;
        ld.push(createOutput(''));
        ld.push(createOutput(`you rolled: ${result}`));
        ld.push(createOutput(''));
        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'hangman',
      description: "'hangman': play a game of hangman",
      execute: (input, ld) => {
        const words = [
          'javascript', 'typescript', 'react', 'nodejs', 'developer',
          'algorithm', 'function', 'variable', 'terminal', 'computer',
          'network', 'database', 'framework', 'library', 'programming'
        ];

        const word = words[Math.floor(Math.random() * words.length)];
        const guessedLetters = new Set<string>();

        ld.push(createOutput(''));
        ld.push(createOutput('Hangman Game'));
        ld.push(createOutput(''));
        ld.push(createOutput(`Word: ${word.split('').map(c => guessedLetters.has(c) ? c : '_').join(' ')}`));
        ld.push(createOutput(''));
        ld.push(createOutput('Usage: hangman guess [letter]'));
        ld.push(createOutput('Example: hangman guess e'));
        ld.push(createOutput(''));
        return ld;
      },
    },
  ];
}
