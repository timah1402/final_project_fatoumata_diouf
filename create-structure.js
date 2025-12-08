const fs = require('fs');
const path = require('path');

const structure = {
  files: ['App.js', 'package.json', 'README.md', 'SETUP_CHECKLIST.md', '.gitignore'],
  dirs: {
    'src': {
      dirs: {
        'config': {
          files: ['firebase.js']
        },
        'constants': {
          files: ['theme.js']
        },
        'screens': {
          files: [
            'HomeScreen.js',
            'GameSelectionScreen.js',
            'JoinGameScreen.js',
            'LobbyScreen.js',
            'QuestionScreen.js',
            'QuestionResultScreen.js',
            'FinalResultsScreen.js'
          ]
        },
        'components': {
          files: [
            'Button.js',
            'GameCard.js',
            'PlayerItem.js',
            'AnswerButton.js',
            'Timer.js',
            'LeaderboardItem.js',
            'ProgressBar.js'
          ]
        },
        'services': {
          files: [
            'gameService.js',
            'playerService.js',
            'realtimeService.js'
          ]
        },
        'store': {
          files: ['gameStore.js']
        },
        'utils': {
          files: ['gameUtils.js']
        },
        'data': {
          files: ['gamesData.js', 'seedGames.js']
        }
      }
    },
    'assets': {
      files: []
    }
  }
};

function createStructure(content, basePath = '.') {
  // Create files in current directory
  if (content.files) {
    content.files.forEach(file => {
      const filePath = path.join(basePath, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
        console.log(`📄 Created: ${filePath}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${filePath}`);
      }
    });
  }
  
  // Create subdirectories
  if (content.dirs) {
    Object.entries(content.dirs).forEach(([dirName, dirContent]) => {
      const dirPath = path.join(basePath, dirName);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created: ${dirPath}`);
      } else {
        console.log(`⏭️  Skipped (exists): ${dirPath}`);
      }
      
      // Recursively create contents
      createStructure(dirContent, dirPath);
    });
  }
}

console.log('🚀 Creating KAHOOT project structure...\n');
createStructure(structure, '.');
console.log('\n✅ File structure created successfully!');
console.log('\n📊 Next steps:');
console.log('   1. Run: npm install');
console.log('   2. Update src/config/firebase.js with your Firebase credentials');
console.log('   3. Run: npm start');