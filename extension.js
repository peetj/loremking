const vscode = require("vscode");
const generator = require("./lib/generator");
const MODE_OPTIONS = [
  { label: "Quote Mode", value: "quote", description: "Stephen King quotes with optional attribution" },
  { label: "King-Style Ipsum", value: "king-ipsum", description: "Horror-flavored literary lorem ipsum" },
  { label: "Creepy Placeholder", value: "creepy-placeholder", description: "Short eerie placeholder text for mockups" },
];

const UNIT_OPTIONS = [
  { label: "Words", value: "words" },
  { label: "Sentences", value: "sentences" },
  { label: "Paragraphs", value: "paragraphs" },
];

function getConfig() {
  const config = vscode.workspace.getConfiguration("loremKing");
  return {
    defaultMode: config.get("defaultMode", "quote"),
    defaultParagraphCount: config.get("defaultParagraphCount", 3),
    includeAttribution: config.get("includeAttribution", true),
  };
}

function getEditor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("Lorem King: No active editor found. Open a file first.");
    return null;
  }
  return editor;
}

function insertText(editor, text) {
  const selection = editor.selection;
  return editor.edit((editBuilder) => {
    if (selection.isEmpty) {
      editBuilder.insert(selection.active, text);
    } else {
      editBuilder.replace(selection, text);
    }
  });
}

function activate(context) {
  console.log('Lorem King v2.0 is now active!');

  // Command: Insert Quote (preserves v1 behavior, enhanced with settings)
  const insertQuoteCommand = vscode.commands.registerCommand(
    "loremking.insertQuote",
    function () {
      const editor = getEditor();
      if (!editor) return;

      const config = getConfig();
      const text = generator.generateQuote(config.includeAttribution);

      insertText(editor, text).then((success) => {
        if (!success) {
          vscode.window.showInformationMessage("Lorem King: Failed to insert quote.");
        }
      });
    }
  );

  // Command: Generate Custom Text
  const generateCustomCommand = vscode.commands.registerCommand(
    "loremking.generateCustom",
    async function () {
      const editor = getEditor();
      if (!editor) return;

      const config = getConfig();

      const modePick = await vscode.window.showQuickPick(MODE_OPTIONS, {
        placeHolder: "Select a content mode",
      });
      if (!modePick) return;

      const unitPick = await vscode.window.showQuickPick(UNIT_OPTIONS, {
        placeHolder: "Generate by...",
      });
      if (!unitPick) return;

      const defaultAmount = unitPick.value === "paragraphs" ? config.defaultParagraphCount : 3;
      const amountInput = await vscode.window.showInputBox({
        prompt: `How many ${unitPick.value}?`,
        value: String(defaultAmount),
        validateInput: (val) => {
          const n = parseInt(val, 10);
          if (isNaN(n) || n < 1 || n > 100) {
            return "Enter a number between 1 and 100";
          }
          return null;
        },
      });
      if (!amountInput) return;

      const amount = parseInt(amountInput, 10);
      const text = generator.generate(modePick.value, unitPick.value, amount, config.includeAttribution);

      insertText(editor, text).then((success) => {
        if (!success) {
          vscode.window.showInformationMessage("Lorem King: Failed to insert text.");
        }
      });
    }
  );

  // Command: Replace Selection
  const replaceSelectionCommand = vscode.commands.registerCommand(
    "loremking.replaceSelection",
    async function () {
      const editor = getEditor();
      if (!editor) return;

      if (editor.selection.isEmpty) {
        vscode.window.showInformationMessage("Lorem King: No text selected. Select some text first.");
        return;
      }

      const config = getConfig();

      const modePick = await vscode.window.showQuickPick(MODE_OPTIONS, {
        placeHolder: "Select a content mode for replacement",
      });
      if (!modePick) return;

      const unitPick = await vscode.window.showQuickPick(UNIT_OPTIONS, {
        placeHolder: "Generate by...",
      });
      if (!unitPick) return;

      const defaultAmount = unitPick.value === "paragraphs" ? config.defaultParagraphCount : 3;
      const amountInput = await vscode.window.showInputBox({
        prompt: `How many ${unitPick.value}?`,
        value: String(defaultAmount),
        validateInput: (val) => {
          const n = parseInt(val, 10);
          if (isNaN(n) || n < 1 || n > 100) {
            return "Enter a number between 1 and 100";
          }
          return null;
        },
      });
      if (!amountInput) return;

      const amount = parseInt(amountInput, 10);
      const text = generator.generate(modePick.value, unitPick.value, amount, config.includeAttribution);

      editor.edit((editBuilder) => {
        editBuilder.replace(editor.selection, text);
      }).then((success) => {
        if (!success) {
          vscode.window.showInformationMessage("Lorem King: Failed to replace selection.");
        }
      });
    }
  );

  // Preserve v1 "deadzone" completion provider
  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: "file" },
    {
      provideCompletionItems(document, position) {
        const linePrefix = document
          .lineAt(position)
          .text.substring(0, position.character);
        if (!linePrefix.endsWith("deadzone")) {
          return undefined;
        }

        const completionItem = new vscode.CompletionItem(
          "deadzone",
          vscode.CompletionItemKind.Text
        );
        completionItem.detail = "Replace 'deadzone' with a random Stephen King quote";
        completionItem.command = {
          command: "loremking.replaceDeadZone",
          title: "Replace DeadZone",
        };

        return [completionItem];
      },
    }
  );

  // Internal command for deadzone replacement (preserved from v1)
  const replaceDeadZoneCommand = vscode.commands.registerCommand(
    "loremking.replaceDeadZone",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      const document = editor.document;
      const selection = editor.selection;
      const wordRange = document.getWordRangeAtPosition(
        selection.start,
        /\bdeadzone\b/
      );

      if (wordRange) {
        const config = getConfig();
        const text = generator.generateQuote(config.includeAttribution);
        editor.edit((editBuilder) => {
          editBuilder.replace(wordRange, text);
        });
      }
    }
  );

  context.subscriptions.push(
    insertQuoteCommand,
    generateCustomCommand,
    replaceSelectionCommand,
    provider,
    replaceDeadZoneCommand
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
