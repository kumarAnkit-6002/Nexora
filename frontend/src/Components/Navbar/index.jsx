import React, { useEffect } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";
import { getAboutUser } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";

export default function NavBarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !authState.profileFetched) {
      dispatch(getAboutUser({ token }));
    }
  }, [authState.profileFetched]);

  const userInitial = authState.user?.userId?.name
    ? authState.user.userId.name.charAt(0).toUpperCase()
    : "U";

  const profilePicUrl = authState.user?.userId?.profilePicture
    ? `${BASE_URL}/${authState.user.userId.profilePicture}`
    : null;

  const isProfile = router.pathname === "/profile";

  return (
    <header className={styles.header}>
      <div className={styles.navBar}>
        {/* Brand Logo */}
        <div
          className={styles.brandContainer}
          onClick={() => {
            router.push(authState.profileFetched ? "/dashboard" : "/");
          }}
        >
          <div className={styles.logoIcon}>
            <span>N</span>
          </div>
          <h1 className={styles.logoText}>Nexora</h1>
        </div>

        {/* Right Section / Auth Controls */}
        <div className={styles.navBarOptionContainer}>
          {authState.profileFetched && authState.user && (
            <div className={styles.userActions}>
              {/* User Profile Pill */}
              <div
                className={styles.userPill}
                onClick={() => router.push("/profile")}
                title="View your profile"
              >
                <div className={styles.avatarWrapper}>
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={authState.user?.userId?.name || "User"}
                      className={styles.userAvatar}
                      onError={(e) => {
                        e.target.style.display = "none";
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={styles.avatarFallback}
                    style={{ display: profilePicUrl ? "none" : "flex" }}
                  >
                    {userInitial}
                  </div>
                  <span className={styles.onlineDot} />
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.greeting}>Hey,</span>
                  <span className={styles.userName}>
                    {authState.user?.userId?.name?.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Profile Nav Button */}
              <button
                type="button"
                className={`${styles.navButton} ${isProfile ? styles.activeButton : ""}`}
                onClick={() => router.push("/profile")}
                title="Go to Profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className={styles.buttonIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <span className={styles.buttonText}>Profile</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                className={styles.logoutButton}
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                  dispatch(reset());
                }}
                title="Log out of your account"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className={styles.buttonIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                  />
                </svg>
                <span className={styles.buttonText}>Logout</span>
              </button>
            </div>
          )}

          {!authState.profileFetched && (
            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              <span>Be a Part</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
