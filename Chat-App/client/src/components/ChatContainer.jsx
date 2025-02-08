import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";

import axios from "axios";
import {
  sendMessageRoute,
  getAllMessagesRoute,
  clearChatRoute,
} from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollRef = useRef();

  const handleSendMsg = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      message: msg,
    });

    setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChat) {
        const response = await axios.get(getAllMessagesRoute, {
          params: {
            from: currentUser._id,
            to: currentChat._id,
          },
        });
        setMessages(response.data);
      }
    };
    fetchMessages();
  }, [currentChat, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (socket.current) {
      const handleMessageReceive = ({ message, from }) => {
        setMessages((prev) => [
          ...prev,
          { fromSelf: from === currentUser._id, message },
        ]);
      };

      socket.current.on("msg-recieve", handleMessageReceive);

      return () => {
        socket.current.off("msg-recieve", handleMessageReceive);
      };
    }
  }, [socket, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChat = async () => {
    setIsModalOpen(true); // Open the confirmation modal
  };

  const confirmClearChat = async () => {
    try {
      await axios.post(clearChatRoute, {
        from: currentUser._id,
        to: currentChat._id,
      });

      setMessages([]); // Clear chat from UI
      toast("Chat successfully cleared.", toastOptions);
      setIsModalOpen(false); // Close modal after clearing
    } catch (error) {
      console.error("Error clearing chat:", error);
      alert("Chat clear karne me error aayi.");
      setIsModalOpen(false); // Close modal on error
    }
  };

  const cancelClearChat = () => {
    setIsModalOpen(false); // Close modal on cancel
  };
  const toastOptions = {
    position: "bottom-left",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };
  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img src={currentChat?.avatarImage} alt="Avatar" />
              </div>
              <div className="username">
                <h3>{currentChat?.username || "Unknown User"}</h3>
              </div>
            </div>

            <div className="menu-container" ref={dropdownRef}>
              <i
                className={`fa-solid fa-ellipsis-vertical menu-icon ${
                  isMenuOpen ? "active" : ""
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              ></i>

              {isMenuOpen && (
                <div className="dropdown">
                  <ul>
                    <li onClick={() => alert("Contact Info Clicked")}>
                      Contact Info
                    </li>
                    <li onClick={() => alert("Select Messages Clicked")}>
                      Select Messages
                    </li>
                    <li onClick={() => alert("Add to Favorites Clicked")}>
                      Add to Favorites
                    </li>
                    <li onClick={() => alert("Close Chat Clicked")}>
                      Close Chat
                    </li>
                    <li onClick={() => alert("Block Clicked")}>Block</li>
                    <li onClick={handleClearChat}>Clear Chat</li>
                    <li onClick={() => alert("Delete Chat Clicked")}>
                      Delete Chat
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div ref={scrollRef} key={uuidv4()}>
                <div
                  className={`message ${
                    message.fromSelf ? "sended" : "recieved"
                  }`}
                >
                  <div className="content">
                    <p>{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ChatInput handleSendMsg={handleSendMsg} />

          {isModalOpen && (
            <Modal>
              <div className="modal-content">
                <h3>Clear this chat?</h3>
                <p>This chat will be empty but will remain in your chat list</p>
                <div className="checkbox-container">
                  <input type="checkbox" />
                  <label>Keep starred messages</label>
                </div>
                <div className="modal-buttons">
                  <button onClick={cancelClearChat}>Cancel</button>
                  <button onClick={confirmClearChat}>Clear Chat</button>
                </div>
              </div>
            </Modal>
          )}
        </Container>
      )}
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  display: grid;
  padding-top: 1rem;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  position: relative;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    height: 70px;
    background-color: rgba(24, 24, 66, 0.9);
    margin-top: -15px;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar img {
        height: 3rem;
      }
      .username h3 {
        color: white;
      }
    }
  }

  .menu-container {
    position: relative;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-icon {
    font-size: 20px;
    color: white;
    cursor: pointer;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      transform 0.3s ease-in-out;
    background-color: transparent;
  }

  .menu-icon.active {
    background-color: rgba(255, 255, 255, 0.81);
    color: rgb(68, 68, 82);
    border-radius: 50%;
    box-shadow: 0px 4px 20px rgba(255, 255, 255, 0.4);
  }

  .dropdown {
    position: absolute;
    top: 37px;
    right: -10px;
    background-color: rgb(28, 28, 59);
    border-radius: 8px;
    width: 180px;
    box-shadow: 0px 4px 10px rgba(70, 68, 68, 0.34);
    z-index: 10;
  }

  .dropdown ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dropdown li {
    padding: 10px;
    cursor: pointer;
    color: white;
    font-size: 14px;
    transition: background 0.3s;
    margin-bottom: 8px;
    margin-top: 6px;
  }

  .dropdown li:hover {
    background-color: #9a86f3;
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  z-index: 1000;

  .modal-content {
    background: #fff;
    width: 400px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: left; /* Left-align all content */
    color: #111;
  }

  .modal-content h3 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 18px;
    color: #222;
  }

  .modal-content p {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
  }

  /* Checkbox and text in one line */
  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 25px;
  }

  .modal-buttons {
    display: flex;
    width: 230px;
    margin-left: 130px;
    justify-content: space-between;
    margin-top: 20px;
  }

  .modal-buttons button {
    flex: 1;
    padding: 10px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: 0.3s;
  }

  .modal-buttons button:first-child {
    background: #fff;
    color: #333;
    margin-right: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .modal-buttons button:last-child {
    background: rgb(44, 27, 122);
    box-shadow: 0 3px 8px rgba(124, 122, 122, 0.73);

    color: white;
  }

  .modal-buttons button:hover {
    opacity: 0.8;
  }
`;
