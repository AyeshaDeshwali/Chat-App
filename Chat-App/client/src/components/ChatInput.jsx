import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null); // Reference for Emoji Picker

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiObject) => {
    // let message = msg;
    // message += emojiObject.emoji;
    setMsg((prevMsg) => prevMsg + emojiObject.emoji);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
          {showEmojiPicker && (
            <EmojiPickerWrapper ref={emojiPickerRef}>
              <Picker onEmojiClick={handleEmojiClick} />
            </EmojiPickerWrapper>
          )}
        </div>
      </div>

      <form className="input-container" onSubmit={(e) => sendChat(e)}>
        <input
          type="text"
          placeholder="Type a message"
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}
// 080420;
const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: rgba(19, 19, 63, 0.9);
  padding: 0 2rem;
  width: ${({ isContactInfoOpen }) =>
    isContactInfoOpen ? "calc(100% - 300px)" : "100%"};

  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }

  .button-container {
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
    }
  }
  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: #ffffff34;
    input {
      width: 90%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      &::selection {
        background-color: #9a86f3;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      cursor: pointer;
      justify-content: center;
      align-items: center;
      background-color: rgb(137, 118, 221);
      border: none;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
  @media screen and (max-width: 480px) {
    grid-template-rows: 15% 75% 10%;

    .chat-messages {
      padding-bottom: 60px; /* Input box ke liye space */
    }

    .chat-input {
      position: fixed;
      bottom: 0;
      width: 100%;
      background: white;
      padding: 10px;
    }
    .emoji {
      display: none; /* Sirf emoji icon aur picker hide ho jayega */
    }
  }
`;
const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 50px;
  border: 2px solid rgba(218, 215, 215, 0.83);
  box-shadow: 0px 4px 20px rgba(221, 221, 233, 0.34);
  z-index: 10;
  border-radius: 8px;
  width: 240px;
  height: 270px;
  overflow-y: auto; /* Enables scrolling */
  background-color: rgb(13, 7, 41);

  /* Scrollbar Styling */
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(13, 7, 41); /* Background matches the container */
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(154, 134, 243, 0.8); /* Scrollbar color */
    border-radius: 4px;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(154, 134, 243, 1); /* Slightly brighter on hover */
  }

  .epr_-xuzz9z,
  .epr_346qu6,
  .epr_-8ygbw8,
  .epr_-oj65po,
  .epr_-xm0i1t,
  .epr_-oj65po:hover,
  .epr_-2zpaw9,
  .epr_-kg0voo {
    background-color: rgb(13, 7, 41);
    color: rgb(223, 223, 223);
  }

  .epr_-kg0voo {
    z-index: var(--epr-preview-z-index);
  }
  .epr_-2zpaw9 {
    border: 1px solid var(--epr-search-input-bg-color);
  }
`;
