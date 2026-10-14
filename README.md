# Kahoot-style Quiz Game — Mobile App

A multiplayer quiz game inspired by Kahoot, built with React Native and Expo. Players create quizzes, join a game with a code, answer timed questions and compete on a live leaderboard.

## Features

- Sign up / log in and manage a player profile
- Create quiz games and manage "My games"
- Join a game with a game code and wait in the lobby
- Timed questions with a progress bar and per-question results
- Live leaderboard and final results screen

## Tech stack

React Native · Expo · Firebase (Firestore) · Zustand · React Navigation

## Project structure

```
src/
├── screens/     # Login, Home, CreateGame, JoinGame, Lobby, Question, Leaderboard, ...
├── components/  # AnswerButton, Timer, ProgressBar, GameCard, LeaderboardItem, ...
├── services/    # Game, player and real-time services (Firebase)
├── store/       # Game state (Zustand)
└── context/     # Authentication context
```

## Getting started

```bash
npm install
npx expo start
```

Add your own Firebase configuration in `src/config/firebase.js`.

## Author

Fatoumata Diouf — [@timah1402](https://github.com/timah1402)
