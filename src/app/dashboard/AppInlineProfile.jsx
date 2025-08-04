import React from "react";
import { useTracked } from "./../../Store";
import { auth } from "../../firebase";

const AppInlineProfile = () => {
  const [state] = useTracked();

  const user = auth.currentUser;
  const displayName = user?.displayName || state?.user?.name || "Guest";
  const role = state?.user?.role || "guest";

  return (
    <div className="profile">
      <div>
        <img src={require("./../../assets/user.png")} alt="user-profile" />
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
