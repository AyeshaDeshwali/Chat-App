import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";

export default function Contacts({ contacts, changeChat, handleLogout }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference for dropdown
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      const storedData = localStorage.getItem(
        process.env.REACT_APP_LOCALHOST_KEY
      );
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data && data.username && data.avatarImage) {
          setCurrentUserName(data.username);
          setCurrentUserImage(data.avatarImage);
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    // Function to close the dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // Attach event listener when dropdown is open
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
    setMenuOpen(false);
  };

  const confirmLogout = async () => {
    setShowLogoutPopup(false);
    await handleLogout(); // ✅ Now this function is properly passed
  };

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>chats</h3>

            {/* Dropdown Toggle Icon */}
            <div className="menu-container" ref={dropdownRef}>
              <i
                className={`fa-solid fa-ellipsis-vertical menu-icon ${
                  menuOpen ? "active" : ""
                }`}
                onClick={() => setMenuOpen(!menuOpen)}
              ></i>
              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="dropdown">
                  <ul>
                    <li>New Group</li>
                    <li>Starred Messages</li>
                    <li>Select Chats</li>
                    <li onClick={handleLogoutClick}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="contacts">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img src={contact.avatarImage} alt="avatar" />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No Results Found</p>
            )}
          </div>

          <div className="current-user">
            <div className="avatar">
              <img src={currentUserImage} alt="avatar" />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
          {showLogoutPopup && (
            <div className="logout-popup">
              <div className="popup-box">
                <h3>Lout out?</h3>
                <p>Are you sure you want to logout?</p>
                <div className="logout-btns">
                  <button
                    className="nobtn"
                    onClick={() => setShowLogoutPopup(false)}
                  >
                    Cancel
                  </button>
                  <button className="yesbtn" onClick={confirmLogout}>
                    Log out
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
  background-color: #080420;
  position: relative;

  .brand {
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
    padding: 10px 24px;
    position: relative;

    img {
      height: 2.5rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
      flex-grow: 1; /* This will keep it centered */
      text-align: center;
      margin-left: -55%;
      flex-grow: 1;
    }
  }

  .menu-container {
    position: relative;
    width: 35px; /* Fixed width taake icon move na ho */
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-icon {
    font-size: 20px;
    color: white;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      transform 0.3s ease-in-out;
    background-color: transparent;
  }

  // .menu-icon:hover {
  //   transform: scale(1.15) rotate(10deg);
  //   background-color: rgba(255, 255, 255, 0.2);
  //   box-shadow: 0px 4px 12px rgba(255, 255, 255, 0.3);
  // }

  .menu-icon.active {
    background-color: rgba(255, 255, 255, 0.81);
    color: rgb(68, 68, 82);
    border-radius: 50%;
    transform: scale(1.3) rotate(360deg); /* Ekdum smooth rotation effect */
    box-shadow: 0px 4px 20px rgba(255, 255, 255, 0.4);
    filter: blur(0.7px); /* Thoda premium blur effect */
  }

  .menu-icon:active {
    transform: scale(1) rotate(0deg); /* Click karne ke baad reset hoke smooth lagega */
    filter: blur(0);
  }

  .dropdown {
    position: absolute;
    top: 37px;
    right: -15px;
    background-color: rgb(28, 28, 59);
    border-radius: 8px;
    width: 180px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .dropdown ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .dropdown li {
    padding: 12px;
    cursor: pointer;
    color: white;
    margin: 5px 0px 5px 0px;
    font-size: 14px;
    transition: background 0.3s;
  }

  .dropdown li:hover {
    background-color: #9a86f3;
  }

  .search-box {
    display: flex;
    justify-content: center;
    padding: 10px;
    position: relative;
    i {
      position: absolute;
      left: 35px; /* Position the icon inside the input field */
      top: 50%;
      transform: translateY(-50%);
      color: rgb(131, 131, 136);
      font-size: 15px;
      pointer-events: none; /* Prevent the icon from being clickable */
    }
    input {
      font-family: "Arial", sans-serif;
      font-weight: 600;
      width: 93%;
      height: 34px;
      padding: 8px 8px 8px 50px;
      border-radius: 8px;
      border: none;
      font-size: 16px;
      background-color: rgba(24, 24, 66, 0.9);
      // background-color: rgb(32, 32, 68);
      color: white;
      outline: none;
    }
  }

  .contacts {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    padding-bottom: 10px;
    gap: 0.8rem;
    flex-grow: 1;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ffffff39;
      border-radius: 3px;
    }

    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.5rem;
      padding: 10px;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.3s ease-in-out;

      .avatar img {
        height: 3rem;

        border-radius: 50%;
      }

      .username h3 {
        color: white;
      }
    }

    .selected {
      background-color: #9a86f3;
    }
  }

  .no-results {
    color: white;
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 25px;
    position: absolute;
    bottom: -45px;
    width: 100%;

    .avatar img {
      height: 4rem;
      margin-left: -1rem;
      margin-top: -0.7rem;
      border-radius: 50%;
    }

    .username h2 {
      color: white;
    }
  }
  .logout-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* Dark overlay */
    backdrop-filter: blur(5px); /* Blur effect */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .popup-box {
    background: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    width: 300px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  .logout-popup h3 {
    font-size: 22px;
    color: #000;
    margin-bottom: 15px;
  }
  .logout-popup p {
    font-size: 16px;
    color: rgb(102, 102, 104);
    margin-bottom: 20px;
  }

  .logout-popup .logout-btns {
    display: flex;
    justify-content: center;
    gap: 15px;
  }

  .logout-popup button {
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    border: none;
    border-radius: 25px;
    transition: all 0.3s ease-in-out;
    font-weight: bold;
  }

  .logout-popup .yesbtn {
    background-color: rgb(44, 27, 122);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 17px;
    box-shadow: 0 3px 8px rgba(124, 122, 122, 0.73);
  }
  .logout-popup .nobtn {
    background: #fff;
    color: #333;
    margin-right: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    border: none;
    border-radius: 50px;
    font-size: 17px;
  }

  @media screen and (max-width: 480px) {
    .current-user {
        margin-bottom: -5.4vh;
      padding: 15px;
    }
    .brand h3 {
      margin-left: -48%;
    }
    .brand img {
      height: 2.3rem;
      margin-left: -8px;
    }
    .search-box input {
      width: 99%;
      font-size: 15px;
      border-radius: 30px;
    }

    .menu-container {
      width: auto; /* Allow the width to adjust dynamically */
      margin-left: 30px; /* Ensure the icon isn't too close to the edge */
    }

    .menu-container .menu-icon {
      margin-right: -10px; /* Reset margin-left to avoid extra shift */
      width: 30px; /* Keep the icon's size consistent */
      height: 30px; /* Ensure the icon stays within a square container */
    }

    .contacts .contact {
      background-color: #ffffff34;
      min-height: 4rem;
      cursor: pointer;
      width: 94%;
      border-radius: 0.5rem;
      padding: 10px;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.3s ease-in-out;
    }
    .dropdown {
      right: -8px;
      width: 180px;
    }
  }
`;
