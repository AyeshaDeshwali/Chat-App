import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";

export default function Welcome({ currentUser }) {
  const [userName, setUserName] = useState("");

  // Updating async logic in useEffect
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      );
      if (userData) {
        setUserName(userData.username);
      }
    };
    fetchUserData();
  }, []);

  // Check if currentUser exists before rendering
  if (!currentUser || !currentUser.username) {
    return <h1>Loading...</h1>;
  }

  return (
    <Container>
      <img src={Robot} alt="" />
      <h1>
        Welcome, <span>{currentUser.username}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;
