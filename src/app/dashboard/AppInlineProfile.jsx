import React from "react";
import { useTracked } from "./../../Store";

const AppInlineProfile = () => {
  const [state] = useTracked();

  // Use state.user which is populated by Firebase onAuthStateChanged
  const user = state?.user;
  const displayName = user?.name || user?.email?.split('@')[0] || "Guest";
  const role = user?.role || "user";

  // Don't render if no user data is available
  if (!user) {
    return (
      <div className="profile">
        <div>
          <img src={require("./../../assets/user.png")} alt="user-profile" />
        </div>
        <a href="#" className="profile-link" onClick={(e) => e.preventDefault()}>
          <span className="username">
            <span>Loading...</span>
            <br />
            <small style={{ color: "#aaa" }}>guest</small>
          </span>
        </a>
      </div>
    );
  }

  return (
    <div className="profile">
      <div>
        <img 
          src={user.photoURL || require("./../../assets/user.png")} 
          alt="user-profile" 
        />
      </div>
      <a href="#" className="profile-link" onClick={(e) => e.preventDefault()}>
        <span className="username">
          <span>{displayName}</span>
          <br />
          <small style={{ color: "#aaa" }}>{role}</small>
        </span>
      </a>
    </div>
  );
};

export default React.memo(AppInlineProfile);
