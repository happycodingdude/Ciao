import Editor from "@draft-js-plugins/editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "@draft-js-plugins/mention";
import "@draft-js-plugins/mention/lib/plugin.css";
import { Tooltip } from "antd";
import { EditorState, convertToRaw, getDefaultKeyBinding } from "draft-js";
import { useCallback, useMemo, useRef, useState } from "react";

const ChatInput = ({ mentions, onClick }) => {
  const editorRef = useRef();
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  const { plugins, MentionSuggestions } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
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

  const callToAction = () => {
    onClick(getContent());
    setEditorState(EditorState.createEmpty());
    setTimeout(() => {
      editorRef.current.focus();
    }, 200);
  };

  const keyBindingFn = (e) => {
    if (e.keyCode == 13 && !e.shiftKey) {
      callToAction();
      return "";
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div className="relative max-h-[10rem] max-w-[50rem] grow">
      <div className="rounded-2xl border-[.2rem] border-[var(--main-color-normal)] py-2 pl-4 pr-16">
        <Editor
          ref={editorRef}
          editorKey={"editor"}
          editorState={editorState}
          onChange={setEditorState}
          plugins={plugins}
          keyBindingFn={keyBindingFn}
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
      <div className="absolute right-0 top-0 flex h-full grow items-center justify-center">
        <Tooltip title="Send">
          <div
            className="fa fa-paper-plane flex aspect-square h-full cursor-pointer items-center justify-center rounded-[.8rem] 
            text-[var(--main-color-medium)]"
            onClick={callToAction}
          ></div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatInput;
