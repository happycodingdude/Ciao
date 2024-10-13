import Editor from "@draft-js-plugins/editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "@draft-js-plugins/mention";
import "@draft-js-plugins/mention/lib/plugin.css";
import { Tooltip } from "antd";
import { EditorState, convertToRaw, getDefaultKeyBinding } from "draft-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfo, useMessage } from "../../hook/CustomHooks";

const ChatInput = (props) => {
  const { send, refChatInputExpose, emoji } = props;

  const { data: messages } = useMessage();
  const { data: info } = useInfo();

  const editorRef = useRef();

  const [directText, setDirectText] = useState("");
  const [mentions, setMentions] = useState();
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);

  useEffect(() => {
    setEditorState(EditorState.createEmpty());
    setDirectText("");
    setMentions(() => {
      return messages?.participants
        .filter((item) => item.contact.id !== info.data.id)
        .map((item) => {
          return {
            name: item.contact.name,
            avatar: item.contact.avatar,
            userId: item.contact.id,
          };
        });
    });
  }, [messages]);

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

  // useEffect(() => {
  //   refChatInputExpose.setText = (text) => {
  //     setDirectText((current) => (current += text));
  //   };
  // }, []);
  useEffect(() => {
    if (!emoji) return;
    // if (messages.isGroup) setEditorState((current) => (current += emoji));
    if (messages.isGroup) setEditorState("abc");
    else setDirectText((current) => (current += emoji));
  }, [emoji]);

  const getContent = () => {
    const contentState = editorState.getCurrentContent();
    const raw = convertToRaw(contentState);
    return raw.blocks[0].text;
  };

  const groupChat = () => {
    // send(getContent());
    // setEditorState(EditorState.createEmpty());
    setEditorState(EditorState.moveFocusToEnd(EditorState.createEmpty()));
    // const moveToEnd = EditorState.moveFocusToEnd(EditorState.createEmpty());
    // setEditorState(moveToEnd);
    // setTimeout(() => {
    // editorRef.current.focus();
    // }, 200);
  };

  const directChat = () => {
    send(directText);
    setDirectText("");
    // setTimeout(() => {
    // editorRef.current.focus();
    // }, 200);
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
        <div className="w-full rounded-2xl bg-[var(--bg-color-extrathin)] py-2 pl-4 pr-16 outline-none">
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
