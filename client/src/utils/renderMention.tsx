import { ReactNode } from "react";

/**
 * Parse and render message with mention format @[name]
 * Mentions will be displayed in red color without @ symbol
 *
 * @param text - Message text containing mentions in format @[name]
 * @returns Array of ReactNode with styled mentions
 *
 * @example
 * renderMessageWithMentions("Hi @[John], check @[Mary]'s report")
 * // Output: Hi <span style="color:red">John</span>, check <span style="color:red">Mary</span>'s report
 */
export function renderMessageWithMentions(text: string): ReactNode[] | string {
  const mentionRegex = /@\[([^\]]+)\]/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add mention with color
    parts.push(
      <span key={`mention-${match.index}`} className="text-light-blue-600">
        {match[1]}
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
