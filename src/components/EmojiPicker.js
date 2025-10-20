import React from "react";
import styles from "./EmojiPicker.module.css";

const emojis = [
  "😀","😄","😂","😍","😎","🥰","🤩","😘","😜","😇",
  "💖","💞","💘","💓","💕","💝","💗","💌","🔥","🌹"
];

export default function EmojiPicker({ onSelect }) {
  return (
    <div className={styles.container}>
      {emojis.map((emoji, idx) => (
        <span
          key={idx}
          className={styles.emoji}
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
