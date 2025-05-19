"use client";
import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import styles from "./style.module.css";
import { cx } from "class-variance-authority";
import { fs } from "@/lib/fs";

interface Props {
  filepath: string;
  onClose: () => void;
}
const NanoSimulator = ({ filepath, onClose }: Props) => {
  const termRef = useRef<HTMLDivElement | null>(null);
  const terminal = useRef<Terminal | null>(null);

  const buffer = useRef<string[]>(Array(20).fill("")); // virtual content buffer
  const cursor = useRef({ row: 0, col: 0 }); // virtual cursor
  const viewportStart = useRef(0); // the top line of the buffer currently shown
  const [cols, setCols] = useState(60); // Initial cols
  const [rows, setRows] = useState(20); // Initial rows

  React.useEffect(() => {
    setupFile();
  }, []);

  const setupFile = async () => {
    const fileExists = await fs
      .stat(filepath)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) return;
    loadFileFromFS(filepath);
  };

  const loadFileFromFS = async (path: string) => {
    try {
      const fileContent = await fs.readFile(path, { encoding: "utf8" });
      const lines = fileContent
        .split("\n")
        .map((line) => line.replace(/\r$/, ""));
      buffer.current = lines;
      cursor.current = { row: 0, col: 0 };
      viewportStart.current = 0;
      renderScreen();
    } catch (err) {
      console.error("Error reading file:", err);
      terminal.current?.write(`\x1b[20;1H[ Error reading file: ${path} ]`);
    }
  };

  const updateTerminalSize = () => {
    if (termRef.current && terminal.current) {
      const { clientWidth, clientHeight } = termRef.current;

      // Calculate cols and rows based on terminal container size
      const calculatedCols = Math.floor(clientWidth / 10); // Adjust based on your font size
      const calculatedRows = Math.floor(clientHeight / 19); // Adjust based on your font size

      setCols(calculatedCols < 60 ? 60 : calculatedCols);
      setRows(calculatedRows);

      // Resize the terminal
      terminal.current.resize(
        calculatedCols < 60 ? 60 : calculatedCols,
        calculatedRows
      );
      renderScreen();
    }
  };

  const saveFileToFS = async (path: string) => {
    const fileExists = await fs
      .stat(path)
      .then(() => true)
      .catch(() => false);
    if (!fileExists) {
      try {
        const content = buffer.current.join("\n");
        // if file not exist and user attempts to save it, create new file
        await fs.writeFile(path, content);
        terminal.current?.write(
          `\x1b[20;1H[ Wrote ${buffer.current.length} lines to ${path} ]`
        );
        return;
      } catch (err) {
        terminal.current?.write(`\x1b[20;1H[ Error saving file: ${err} ]`);
      }
    }

    try {
      const content = buffer.current.join("\n");
      await fs.writeFile(path, content);
      terminal.current?.write(
        `\x1b[20;1H[ Wrote ${buffer.current.length} lines to ${path} ]`
      );
    } catch (err) {
      terminal.current?.write(`\x1b[20;1H[ Error saving file: ${err} ]`);
    }
  };

  const renderScreen = () => {
    const term = terminal.current;
    if (!term) return;

    term.write("\x1b[?25l");
    term.reset();
    term.write("\x1b[30;47m"); // Black text on white background
    term.write(`GNU nano 6.0   File: ${filepath}\r\n`);
    term.write("\x1b[0m"); // Reset to default colors
    term.write("\r\n"); // Extra line after header

    for (let i = 0; i < rows - 3; i++) {
      const line = buffer.current[viewportStart.current + i] || "";
      term.write(line.padEnd(cols) + "\r\n");
    }

    // Position cursor
    const cursorRow = cursor.current.row - viewportStart.current + 3;
    const cursorCol = cursor.current.col + 1;
    term.write("\x1b[?25h");
    term.write(`\x1b[${cursorRow};${cursorCol}H`);
  };

  const moveCursor = (deltaRow: number, deltaCol: number) => {
    const buf = buffer.current;
    const newRow = Math.max(
      0,
      Math.min(buf.length - 1, cursor.current.row + deltaRow)
    );
    const line = buf[newRow] || "";
    const newCol = Math.max(
      0,
      Math.min(line.length, cursor.current.col + deltaCol)
    );

    cursor.current.row = newRow;
    cursor.current.col = newCol;

    // Handle scrolling
    if (newRow < viewportStart.current) {
      viewportStart.current = newRow;
    } else if (newRow >= viewportStart.current + (rows - 3)) {
      viewportStart.current = newRow - (rows - 4);
    }

    //updateCurrentLine();
    renderScreen();
  };

  const insertChar = (char: string) => {
    const { row, col } = cursor.current;
    const lines = buffer.current;
    const line = lines[row] || "";
    const newLine = line.slice(0, col) + char + line.slice(col);
    lines[row] = newLine;
    cursor.current.col += 1;
    updateCurrentLine();
    //renderScreen();
  };

  const handleBackspace = () => {
    const { row, col } = cursor.current;
    const lines = buffer.current;
    if (col > 0) {
      const line = lines[row];
      lines[row] = line.slice(0, col - 1) + line.slice(col);
      cursor.current.col -= 1;
    } else if (row > 0) {
      const prevLine = lines[row - 1];
      const currentLine = lines[row];
      cursor.current.row -= 1;
      cursor.current.col = prevLine.length;
      lines[row - 1] = prevLine + currentLine;
      lines.splice(row, 1);
    }
    updateCurrentLine();
    //renderScreen();
  };

  const handleEnter = () => {
    const { row, col } = cursor.current;
    const lines = buffer.current;
    const line = lines[row];
    const before = line.slice(0, col);
    const after = line.slice(col);
    lines[row] = before;
    lines.splice(row + 1, 0, after);

    cursor.current.row += 1;
    cursor.current.col = 0;

    // 💡 Ensure new cursor row is within viewport
    if (cursor.current.row >= viewportStart.current + (rows - 3)) {
      viewportStart.current = cursor.current.row - (rows - 4);
    }

    renderScreen();
  };

  const updateCurrentLine = () => {
    const term = terminal.current;
    if (!term) return;

    const { row, col } = cursor.current;
    const lineIndex = row - viewportStart.current;

    if (lineIndex < 0 || lineIndex >= rows - 3) return; // out of view

    const line = buffer.current[row] || "";
    const cursorRow = lineIndex + 3;

    term.write(`\x1b[${cursorRow};1H`); // Move to line start
    term.write(line.padEnd(cols));
    term.write(`\x1b[${cursorRow};${col + 1}H`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts only for known nano keys
      if (
        e.ctrlKey &&
        ["g", "o", "w", "k", "c", "x", "r", "t"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault(); // Stop the browser from hijacking it
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!termRef.current) return;
    termRef.current.focus();

    const term = new Terminal({
      rows: rows,
      cols: cols,
      cursorBlink: true,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
    });

    terminal.current = term;
    term.open(termRef.current);
    renderScreen();

    term.onData((data) => {
      if (!data) return;

      const code = data.charCodeAt(0);

      if (data === "\x1b[A") return moveCursor(-1, 0); // up
      if (data === "\x1b[B") return moveCursor(1, 0); // down
      if (data === "\x1b[C") return moveCursor(0, 1); // right
      if (data === "\x1b[D") return moveCursor(0, -1); // left

      if (code === 127) return handleBackspace(); // backspace
      if (code === 13) return handleEnter(); // enter
      if (code === 24) {
        // Ctrl+X

        term.write("\x1b[20;1H[ Exiting nano ]");
        onClose();
        return;
      }

      if (code === 15) {
        // Ctrl+O
        saveFileToFS(filepath);
        return;
      }

      if (code === 7) {
        // Ctrl+G
        term.write("\x1b[20;1H[ Help not implemented yet ]");
        return;
      }
      if (code === 23) {
        // Ctrl+W
        term.write("\x1b[20;1H[ Search not implemented yet ]");
        return;
      }
      if (code === 11) {
        // Ctrl+K
        term.write("\x1b[20;1H[ Cut not implemented yet ]");
        return;
      }
      if (code === 3) {
        // Ctrl+C
        const { row, col } = cursor.current;
        term.write(`\x1b[20;1H[ Cursor at row ${row + 1}, col ${col + 1} ]`);
        return;
      }
      if (code === 18) {
        // Ctrl+R
        term.write("\x1b[20;1H[ Read not implemented yet ]");
        return;
      }
      if (code === 20) {
        // Ctrl+T
        term.write("\x1b[20;1H[ Execute not implemented yet ]");
        return;
      }

      // Printable characters
      if (code >= 32 && code <= 126) {
        insertChar(data);
      }
    });

    updateTerminalSize();

    // Resize listener
    window.addEventListener("resize", updateTerminalSize);

    return () => {
      window.removeEventListener("resize", updateTerminalSize);
      term.dispose();
    };
  }, []);

  return (
    <div className="h-full">
      <div
        className="h-[90%] p-4"
        tabIndex={0}
        ref={termRef}
        style={{ backgroundColor: "black" }}
      />

      <div className={cx("bg-[#000000] text-[#ffffff]", styles.footer)}>
        <div className="flex gap-2 block justify-between">
          <div className="w-1/4">^G Get Help</div>
          <div className="w-1/4">^O Write Out</div>
          <div className="w-1/4">^W Where Is</div>
          <div className="w-1/4">^K Cut Text</div>
        </div>
        <div className="flex gap-2 block justify-between">
          <div className="w-1/4">^C Cur Pos</div>
          <div className="w-1/4">^X Exit</div>
          <div className="w-1/4">^R Read File</div>
          <div className="w-1/4">^T Execute</div>
        </div>
      </div>
    </div>
  );
};

export default NanoSimulator;
