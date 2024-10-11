import Editor from "@draft-js-plugins/editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "@draft-js-plugins/mention";
import "@draft-js-plugins/mention/lib/plugin.css";
import { Tooltip } from "antd";
import { EditorState, convertToRaw, getDefaultKeyBinding } from "draft-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetchParticipants, useMessage } from "../../hook/CustomHooks";

const ChatInput = (props) => {
  const { send, refChatInputExpose } = props;
  const { mentions } = useFetchParticipants();
  const { data: messages } = useMessage();

  const editorRef = useRef();
  const [directText, setDirectText] = useState("");

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

  useEffect(() => {
    setSuggestions(mentions);
  }, [mentions]);

  useEffect(() => {
    refChatInputExpose.setText = (text) => {
      setDirectText((current) => (current += text));
    };
  }, []);

  const getContent = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    return raw.blocks[0].text;
  };

  const groupChat = () => {
    send(getContent());
    setEditorState(EditorState.createEmpty());
    setTimeout(() => {
      editorRef.current.focus();
    }, 200);
  };

  const directChat = () => {
    send(directText);
    setDirectText("");
    setTimeout(() => {
      editorRef.current.focus();
    }, 200);
  };

  const callToAction = () => {
    if (messages.isGroup) groupChat();
    else directChat();
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
      {messages.isGroup ? (
        <div className="rounded-2xl bg-[var(--bg-color-light)] py-2 pl-4 pr-16">
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
      ) : (
        <input
          ref={editorRef}
          value={directText}
          onChange={(e) => setDirectText(e.target.value)}
          className="w-full rounded-2xl bg-[var(--bg-color-extrathin)] py-2 pl-4 pr-16 outline-none"
          onKeyDown={keyBindingFn}
        />
      )}
      <div className="absolute right-[1%] top-0 flex h-full grow cursor-pointer items-center justify-center">
        <Tooltip title="Send">
          <div
            className="fa fa-paper-plane flex aspect-square h-full items-center justify-center rounded-[.8rem] text-[var(--main-color-light)]"
            onClick={callToAction}
          ></div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ChatInput;
