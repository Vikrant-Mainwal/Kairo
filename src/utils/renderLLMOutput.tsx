export const renderLLMOutput = (text: string) => {
  // Normalize spacing
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n");

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  return lines.map((line, index) => {
    const trimmed = line.trim();

     
    // CODE BLOCK START / END
     
    if (trimmed.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
        return null;
      }

      inCodeBlock = false;

      return (
        <pre
          key={index}
          className="
            bg-neutral-950
            border border-neutral-800
            rounded-xl
            px-4 py-3
            my-3
            overflow-x-auto
            text-sm
            leading-6
            text-neutral-200
            font-mono
          "
        >
          <code>{codeBuffer.join("\n")}</code>
        </pre>
      );
    }

    // Collect code block lines
    if (inCodeBlock) {
      codeBuffer.push(line);
      return null;
    }

     
    // EMPTY LINE
     
    if (!trimmed) {
      return <div key={index} className="h-2" />;
    }

     
    // MARKDOWN HEADINGS
    // # ## ### ####
     
    if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;

      const text = trimmed.replace(/^#{1,6}\s/, "");

      const headingStyles = {
        1: "text-2xl font-bold mt-5 mb-3",
        2: "text-xl font-bold mt-4 mb-2",
        3: "text-lg font-semibold mt-4 mb-2",
        4: "text-base font-semibold mt-3 mb-1",
        5: "text-sm font-semibold mt-2 mb-1",
        6: "text-sm font-medium mt-2 mb-1",
      };

      return (
        <div
          key={index}
          className={`text-white ${
            headingStyles[level as keyof typeof headingStyles]
          }`}
        >
          {parseInlineMarkdown(text)}
        </div>
      );
    }

     
    // NUMBERED LIST
    // 1. item
     
    if (/^\d+\.\s/.test(trimmed)) {
      const number = trimmed.match(/^\d+\./)?.[0];

      const content = trimmed.replace(/^\d+\.\s*/, "");

      return (
        <div
          key={index}
          className="
            flex gap-3
            my-0.5
            text-neutral-300
            leading-6
          "
        >
          <span
            className="
              text-neutral-400
              font-medium
              min-w-5
            "
          >
            {number}
          </span>

          <span className="flex-1">
            {parseInlineMarkdown(content)}
          </span>
        </div>
      );
    }

     
    // BULLET LIST
    // - item
    // * item
     
    if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ")
    ) {
      return (
        <div
          key={index}
          className="
            flex gap-2
            my-0.5
            ml-1
            text-neutral-300
            leading-6
          "
        >
          <span className="text-neutral-400 mt-px">
            •
          </span>

          <span className="flex-1">
            {parseInlineMarkdown(trimmed.slice(2))}
          </span>
        </div>
      );
    }

    
    // BLOCKQUOTE
    // > text
     
    if (trimmed.startsWith("> ")) {
      return (
        <div
          key={index}
          className="
            border-l-2 border-neutral-700
            pl-3
            italic
            text-neutral-400
            my-2
          "
        >
          {parseInlineMarkdown(trimmed.slice(2))}
        </div>
      );
    }

     
    // HORIZONTAL DIVIDER
    // ---
    // ***
     
    if (
      trimmed === "---" ||
      trimmed === "***"
    ) {
      return (
        <hr
          key={index}
          className="border-neutral-800 my-3"
        />
      );
    }

     
    // TITLE: content
    // Example:
    // Key: Value
     
    const colonIndex = trimmed.indexOf(":");

    if (
      colonIndex > 0 &&
      colonIndex < 40 &&
      !trimmed.startsWith("http")
    ) {
      const title = trimmed.slice(0, colonIndex + 1);

      const content = trimmed.slice(colonIndex + 1);

      return (
        <p
          key={index}
          className="
            text-neutral-300
            leading-6
            my-0.5
          "
        >
          <span className="font-semibold text-white">
            {title}
          </span>

          {" "}

          {parseInlineMarkdown(content)}
        </p>
      );
    }

     
    // NORMAL PARAGRAPH
     
    return (
      <p
        key={index}
        className="
          text-neutral-300
          leading-6
          my-0.5
        "
      >
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });
};

// INLINE MARKDOWN PARSER


function parseInlineMarkdown(text: string) {
  const parts = text.split(
    /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g
  );

  return parts.map((part, index) => {
     
    // BOLD
    // **text**
     
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="font-semibold text-white"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

     
    // INLINE CODE
    // `code`
     
    if (
      part.startsWith("`") &&
      part.endsWith("`")
    ) {
      return (
        <code
          key={index}
          className="
            bg-neutral-900
            border border-neutral-800
            rounded
            px-1.5 py-0.5
            text-[13px]
            text-emerald-400
            font-mono
          "
        >
          {part.slice(1, -1)}
        </code>
      );
    }

     
    // LINKS
    // [text](url)
     
    const linkMatch = part.match(
      /\[(.*?)\]\((.*?)\)/
    );

    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="
            text-blue-400
            hover:text-blue-300
            underline
          "
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}