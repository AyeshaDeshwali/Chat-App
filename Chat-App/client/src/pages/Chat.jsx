import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host, clearChatRoute } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";
import { FaArrowLeft } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Chat = () => {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const dropdownRef = useRef(null);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const savedUser = localStorage.getItem("chat-app-user");
      if (!savedUser) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(savedUser);
      if (user.isAvatarImageSet) {
        setCurrentUser(user);
        setLoading(false);
      } else {
        navigate("/setAvatar");
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    async function fetchContacts() {
      if (currentUser && currentUser.isAvatarImageSet) {
        try {
          const { data } = await axios.get(
            `${allUsersRoute}/${currentUser._id}`
          );
          setContacts(data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching users:", error);
          setLoading(false);
        }
      } else {
        navigate("/setAvatar");
      }
    }
    if (currentUser) fetchContacts();
  }, [currentUser, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return null;

  const handleLogout = () => {
    localStorage.removeItem("chat-app-user");
    navigate("/login");
  };

  const goBackToContacts = () => setCurrentChat(undefined);
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
  return (
    <Container>
      <div className="container">
        {isMobile && currentChat ? (
          <div className="chat-container">
            {/* Mobile Header: Yahi header dikh raha hai */}
            <div className="mobile-chat-header">
              <button className="back-button" onClick={goBackToContacts}>
                <FaArrowLeft />
              </button>
              <div className="user-info">
                <img
                  src={currentChat.avatarImage}
                  alt="avatar"
                  className="avatar"
                />
                <span className="username">{currentChat.username}</span>
              </div>
              <div className="menu-container">
                <BsThreeDotsVertical
                  className="menu-icon"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown &&
                  currentChat && ( // Ensure it only appears when chat is open
                    <div className="dropdown">
                      <ul>
                        <li onClick={() => setIsContactInfoOpen(true)}>
                          Contact Info
                        </li>
                        <li onClick={() => alert("Select Messages Clicked")}>
                          Select Messages
                        </li>
                        <li onClick={() => alert("Add to Favorites Clicked")}>
                          Add to Favorites
                        </li>
                        <li>Close Chat</li>
                        <li onClick={() => alert("Block Clicked")}>Block</li>
                        <li onClick={handleClearChat}>Clear Chat</li>
                        <li>Delete Chat</li>
                      </ul>
                    </div>
                  )}
              </div>
            </div>
            <ChatContainer
              currentChat={currentChat}
              currentUser={currentUser}
              socket={socket}
              hideHeader={true}
            />
          </div>
        ) : (
          <>
            <Contacts
              contacts={contacts}
              currentUser={currentUser}
              changeChat={(chat) => setCurrentChat(chat)}
              handleLogout={handleLogout}
            />
            {currentChat === undefined ? (
              <Welcome currentUser={currentUser} />
            ) : (
              <ChatContainer
                currentChat={currentChat}
                currentUser={currentUser}
                socket={socket}
              />
            )}
          </>
        )}
      </div>
      {isContactInfoOpen && (
        <ContactInfoSidebar isContactInfoOpen={isContactInfoOpen}>
          <div className="contact-header">
            <button
              className="close-btn"
              onClick={() => setIsContactInfoOpen(false)}
            >
              X
            </button>
            <h3>Contact Info</h3>
            <i className="fa-solid fa-pen"></i>
          </div>
          <div className="contact-body">
            <img
              src={currentChat?.avatarImage}
              alt="Avatar"
              className="contact-avatar"
            />
            <h4>{currentChat?.username}</h4>
          </div>
        </ContactInfoSidebar>
      )}
    </Container>
  );
};
const ContactInfoSidebar = styled.div`
  position: absolute;
  right: 144px;
  top: 70px;
  width: 300px;
  height: 84.6vh;
  border-left: 1px solid rgba(138, 134, 134, 0.49);
  background: rgb(22 22 78);
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.2);
  padding: 20px;
  display: flex;
  flex-direction: column;
  color: white;

  .contact-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: white;
  }

  .contact-body {
    text-align: center;
  }

  .contact-avatar {
    width: 200px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.82);
    height: 200px;
    border-radius: 50%;
    margin-bottom: 10px;
    margin-top: 20px;
  }

  .contact-body h4 {
    margin-top: 10px;
    font-size: 20px;
    letter-spacing: 1px;
  }

  @media screen and (max-width: 480px) {
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgb(22 22 78);
    box-shadow: none;
    z-index: 10;
    padding: 10px;
    .contact-avatar {
      width: 150px;
      height: 150px;
    }
    .contact-body h4 {
      font-size: 18px;
    }
  }
`;

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #131324;

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;

    @media screen and (max-width: 480px) {
      grid-template-columns: 100%;
    }
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .mobile-chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: rgba(24, 24, 66, 0.9);
    color: white;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .menu-container {
    position: relative;
  }
  .menu-container .menu-icon {
    font-size: 20px;
  }
  .dropdown {
    position: absolute;
    right: 0;
    right: -18px;
    top: 35px;
    top: 30px;
    background-color: rgb(28, 28, 59);
    padding: 10px;
    border-radius: 5px;
    z-index: 10;
  }

  .dropdown ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .dropdown ul li {
    padding: 8px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .dropdown ul li:hover {
    background-color: #ffffff34;
  }
  @media screen and (max-width: 480px) {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center; /* Center content horizontally */
    align-items: center; /* Center content vertically */
    background-color: #131324;
    margin: 0;
    padding: 0; /* Ensure no padding on the body or container */

    .container {
      height: 100%; /* Fill the container's height */
      width: 100%; /* Fill the container's width */
      display: grid;
      grid-template-columns: 1fr; /* 1-column layout */
    }
    .back-button {
      background-color: rgba(24, 24, 66, 0.9);
      border: none;
      font-size: 17px;
      color: white; /* Icon ka color */
      cursor: pointer;
      font-weight: 100;
    }
    .dropdown {
      right: -8px;
      width: 180px; /* Increased width */
    }

    .dropdown ul li {
      padding: 10px;
    }
    .message {
      max-width: 90%;
    }
  }
`;


export default Chat;
