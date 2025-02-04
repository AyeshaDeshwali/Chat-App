import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";

const Chat = () => {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined); // Current user
  const [currentChat, setCurrentChat] = useState(undefined); // Selected chat
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchData = async () => {
      const savedUser = localStorage.getItem("chat-app-user");
      if (!savedUser) {
        navigate("/login"); // If no user is found, redirect to login
        return;
      }

      const user = JSON.parse(savedUser);
      if (user.isAvatarImageSet) {
        setCurrentUser(user); // Set currentUser if avatar is set
        setLoading(false); // Stop loading once user is set
      } else {
        navigate("/setAvatar"); // Navigate to setAvatar if avatar is not set
      }
    };
    fetchData(); // Call the fetch function
  }, [navigate]); // Dependency on navigate to refresh

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
          setContacts(data); // Set contacts when current user data is valid
          setLoading(false); // Stop loading once contacts are fetched
        } catch (error) {
          console.error("Error fetching users:", error);
          setLoading(false); // In case of error, stop loading as well
        }
      } else {
        navigate("/setAvatar");
      }
    }
    if (currentUser) fetchContacts(); // Fetch contacts only when current user is available
  }, [currentUser, navigate]);

  // If data is still loading, show "Loading..."
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return null; // Return nothing if currentUser is not yet set
  }

  return (
    <Container>
      <div className="container">
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          changeChat={(chat) => setCurrentChat(chat)}
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
      </div>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;
