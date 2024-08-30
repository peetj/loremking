const vscode = require("vscode");

function activate(context) {
  console.log('Congratulations, your extension "Lorem King" is now active!');

// Register the command and bind it to the getRandomQuote function
const insertQuoteCommand = vscode.commands.registerCommand(
  "loremking.insertQuote",
  function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("No active editor");
      return;
    }

    const quote = getRandomQuote();
    const position = editor.selection.active;

    editor.edit((editBuilder) => {
      editBuilder.insert(position, quote);
    }).then(success => {
      if (success) {
        vscode.window.showInformationMessage(`Inserted quote: "${quote}"`);
      } else {
        vscode.window.showInformationMessage("Failed to insert quote.");
      }
    });
  }
);

const provider = vscode.languages.registerCompletionItemProvider(
    [
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "html" },
    ],
    {
      provideCompletionItems(document, position) {
        const linePrefix = document
          .lineAt(position)
          .text.substr(0, position.character);
        if (!linePrefix.endsWith("deadzone")) {
          return undefined;
        }

        const completionItem = new vscode.CompletionItem(
          "deadzone",
          vscode.CompletionItemKind.Method
        );
        completionItem.detail = "Replace 'deadzone' with a random quote from a Stephen King novel";
        completionItem.command = {
          command: "loremking.replaceDeadZone",
          title: "Replace DeadZone",
        };

        return [completionItem];
      },
    }
  );

  // Function to return a random quote from a list
  const getRandomQuote = () => {
    const quotes = [
      "Monsters are real, and ghosts are real too. They live inside us, and sometimes, they win.",
      "The man in black fled across the desert, and the gunslinger followed.",
      "Books are a uniquely portable magic, able to transport us to other worlds and times, making us feel alive in new ways.",
      "Hope is a good thing, maybe the best of things, and no good thing ever dies. It keeps us going even in the darkest times.",
      "We all float down here, and when you’re down here with us, you’ll float too.",
      "The scariest moment is always just before you start. After that, things can only get better.",
      "Sometimes dead is better. The soil of a man's heart is stonier, but sometimes, the land doesn't forgive.",
      "Get busy living, or get busy dying. It's a choice we make every day, in big ways and small.",
      "I am the literary equivalent of a Big Mac and fries, something that's always there when you need it.",
      "There’s no harm in hoping for the best as long as you’re prepared for the worst.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // Command to replace "deadzone" with a random quote
  const replaceDeadZoneCommand = vscode.commands.registerCommand(
    "loremking.replaceDeadZone",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return; // No active editor
      }

      const document = editor.document;
      const selection = editor.selection;
      const wordRange = document.getWordRangeAtPosition(
        selection.start,
        /\bdeadzone\b/
      );

      if (wordRange) {
        const randomQuote = getRandomQuote();
        editor
          .edit((editBuilder) => {
            editBuilder.replace(wordRange, randomQuote);
          })
          .then((success) => {
            if (success) {
              vscode.window.showInformationMessage(
                `deadzone replaced with: "${randomQuote}"`
              );
            }
          });
      }
    }
  );

  context.subscriptions.push(provider, insertQuoteCommand, replaceDeadZoneCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
