import Editor from "@draft-js-plugins/editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "@draft-js-plugins/mention";
import "@draft-js-plugins/mention/lib/plugin.css";
import { Tooltip } from "antd";
import { EditorState, convertToRaw } from "draft-js";
import { useCallback, useMemo, useState } from "react";

const ChatInput = ({ mentions, onClick }) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  const { plugins, MentionSuggestions } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    // eslint-disable-next-line no-shadow
    const { MentionSuggestions } = mentionPlugin;
    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  const onOpenChange = useCallback((_open) => {
    setOpen(_open);
  }, []);
  const onSearchChange = useCallback(
    (value) => {
      setSuggestions(defaultSuggestionsFilter(value.value, mentions));
    },
    [mentions],
  );

  const getContent = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    return raw.blocks[0].text;
  };
  const getMentioned = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    let mentionedUsers = [];
    for (let key in raw.entityMap) {
      const ent = raw.entityMap[key];
      if (ent.type === "mention") {
        mentionedUsers.push(ent.data.mention);
      }
    }
    return mentionedUsers;
  };

  return (
    <div className="relative max-w-[50rem] grow">
      <div className="rounded-2xl border-2 border-pink-300 py-2 pl-4 pr-16">
        <Editor
          editorKey={"editor"}
          editorState={editorState}
          onChange={setEditorState}
          plugins={plugins}
        />
        <MentionSuggestions
          open={open}
          onOpenChange={onOpenChange}
          suggestions={suggestions}
          onSearchChange={onSearchChange}
          onAddMention={() => {
            // get the mention object selected
          }}
        />
      </div>
      <div
        className="absolute right-0 top-0 flex h-full grow 
              items-center justify-center"
      >
        <Tooltip title="Send">
          <div
            className="fa fa-paper-plane flex aspect-square h-full 
                    cursor-pointer items-center justify-center rounded-[.8rem] 
                    text-pink-500"
            onClick={() => {
              console.log(getMentioned());
              onClick(getContent());
            }}
          ></div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatInput;
