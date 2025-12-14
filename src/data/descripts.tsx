const commands = [
    "view-source",
    "view-react-docs",
    "clear",
    "help",
    "hello there",
    "echo",
    "ln",
    "ls",
    "cd",
    "theme",
    "pwd",
    "cat",
    "whoami",
    "ps",
    "start",
    "time",
    "stats",
    "global-stats",
    "history",
];

const help = [
    " ",
    "Having troubles? Here's some help!",
    " ",
    "Try any of the following commands:",
    "'cat [file_name]': show file contents",
    "'cd [dir_name]': change directory",
    "'clear': clear the terminal",
    "'echo [str_to_echo]': echo following string",
    "'global-stats': show aggregate visitor statistics",
    "'help': display this page",
    "'history': show command history",
    "'ln [file_name]': opens appropriate url for file",
    "'ls': list contents of current directory",
    "'ps [string_prompt]': set prompt string",
    "'pwd': print working directory",
    "'start': show the start message",
    "'stats': show your personal session statistics",
    "'theme [type]': change theme [light, dark]",
    "'time': display ISO time",
    "'view-react-docs': navigate to the react docs",
    "'view-source': navigate to the React Terminal UI github source",
    "'whoami': prints info about me, Andrew Smith",
];

const start = [
    " ",
    "Welcome to voigniersmith.com!",
    " ",
    "My name is Andrew Smith, and as of Spring 2023, I am working",
    "on my Master's degree with an expectation to finish in May.",
    "Currently, I have signed on with Amazon in New York for a",
    "full-time position as a Software Engineer starting in August.",
    "Anyhow, welcome to my portfolio website v2.",
    " ",
    "This is a proprietary shell built in React!",
    "Go ahead and explore by typing in the terminal below.",
    " ",
    "For help with possible commands, type 'help' and hit enter.",
    "(P.S. there are some secrets hidden around, so start looking!)"
];

const pppsDes = [
    "Powder Pixel Physics Simulator",
    " ",
    "As an introduction to computer graphics, this was",
    "my final project. Inspiration comes from the Powder",
    "Game by Dan-Ball (https://dan-ball.jp/en/javagame/dust/).",
    "My version is implemented using shaders in C++.",
];

const shellDes = [
    "A zsh & bash Proprietary Shell",
    " ",
    "The Purdue CS252 Final Project. Implementing basic features",
    "such as command parsing, pipes, and wildcards in C++."
];

const omiliaDes = [
    "Omilia: A Twitter, Facebook, Reddit Clone",
    " ",
    "Semester-long project that was meant as an excersise for",
    "the Agile software development cycle. Successfully turned",
    "into a social media application using a FERN stack.",
];

const mymallocDes = [
    "Proprietary Optimized Memory Allocation Library",
    " ",
    "An academic example of Doug Lea's Memory Allocator.",
];

const bugdetectDes = [
    "Clang Compiler Static Bug Detector",
    " ",
    "For my Software Testing course, we implemented a",
    "static bug detector analyzing paired function calls.",
];

const voigniersmithDes = [
    "My Personal Portfolio Website",
    " ",
    "Initially inspired by Michael D'angelo's personal site,",
    "it's turned into my own idea of a proprietary React shell."
];

const pagingDes = [
    "Enabling Paging for an x86 Intel Galileo Machine",
    " ",
    "The final project for Purdue's Graduate Operating Systems",
    "course, I implemented and designed my own paging structures",
    "as well as adding support for TLB and Paging in C on the Xinu",
    "OS."
];

const chessDes = [
    "Parallel Chess",
    " ",
    "The final project for CS525 Parallel Computing, this program",
    "is chess in C. The parallelism comes with Alpha-Beta pruning",
    "of user-defined-depth search trees to determine the CPU's",
    "next move."
];

const cryptocalcDes = [
    "A Cryptographic Calculator",
    " ",
    "By manually adding functionality for ElGamal Key Sharing,",
    "Shamir's Secret Sharing, and Algorand Smart Contracts, we",
    "were able to have a client successfully pay multiple parties",
    "to perform calculations without knowing what information",
    "they were computing or what information they were given."
];

const moodifyDes = [
    "Moodify",
    " ",
    "By using Spotify's API, we were able to implement a",
    "community-based recommendation algorithm that allows",
    "user's to build playlists based on their current mood.",
    "This was my undergrad Senior project."
];

export {
    commands,
    help,
    start,
    pppsDes,
    shellDes,
    omiliaDes,
    mymallocDes,
    bugdetectDes,
    voigniersmithDes,
    pagingDes,
    chessDes,
    cryptocalcDes,
    moodifyDes
};