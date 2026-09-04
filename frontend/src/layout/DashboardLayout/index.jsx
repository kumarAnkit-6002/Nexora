import React, { useEffect } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config";
import { getAllUsers } from "@/config/redux/action/authAction";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    }
    dispatch(setTokenIsThere());
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch, router]);

  return (
    <div>
      <div className="container">
        <div className={styles.homeContainer}>
          {/* Left Navigation Bar */}
          <div className={styles.homeContainer_leftBar}>
            <div
              onClick={() => {
                router.push("/dashboard");
              }}
              className={`${styles.sideBarOption} ${
                router.pathname === "/dashboard" ? styles.activeOption : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <p>Scroll</p>
            </div>

            <div
              onClick={() => {
                router.push("/discover");
              }}
              className={`${styles.sideBarOption} ${
                router.pathname === "/discover" ? styles.activeOption : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p>Discover</p>
            </div>

            <div
              onClick={() => {
                router.push("/my_connections");
              }}
              className={`${styles.sideBarOption} ${
                router.pathname === "/my_connections" ? styles.activeOption : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <p>My Connection</p>
            </div>
          </div>

          {/* Feed Container */}
          <div className={styles.homeContainer_feedContainer}>{children}</div>

          {/* Top Profiles Sidebar Card */}
          <div className={styles.homeContainer_extraContainer}>
            <div className={styles.topProfilesWidget}>
              <div className={styles.widgetHeader}>
                <div className={styles.widgetTitleGroup}>
                  <div className={styles.widgetIconBox}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </div>
                  <h3 className={styles.widgetTitle}>Top Profiles</h3>
                </div>
                <span
                  className={styles.widgetLink}
                  onClick={() => router.push("/discover")}
                >
                  Explore
                </span>
              </div>

              <div className={styles.profilesList}>
                {authState.all_profiles_fetched &&
                  authState.all_users.slice(0, 5).map((profile) => {
                    if (!profile.userId) return null;
                    const profilePicUrl = profile.userId.profilePicture
                      ? `${BASE_URL}/${profile.userId.profilePicture}`
                      : null;
                    const initial = profile.userId.name
                      ? profile.userId.name.charAt(0).toUpperCase()
                      : "U";

                    return (
                      <div
                        key={profile._id}
                        className={styles.extraContainer_profile}
                        onClick={() => {
                          if (profile.userId?.username) {
                            router.push(`/view_profile/${profile.userId.username}`);
                          }
                        }}
                        title={`View ${profile.userId?.name}'s profile`}
                      >
                        <div className={styles.profileAvatarWrapper}>
                          {profilePicUrl ? (
                            <img
                              src={profilePicUrl}
                              alt={profile.userId.name}
                              className={styles.profileAvatar}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className={styles.profileAvatarFallback}>
                              {initial}
                            </div>
                          )}
                        </div>

                        <div className={styles.profileDetails}>
                          <p className={styles.profileName}>
                            {profile.userId.name}
                          </p>
                          <p className={styles.profileHandle}>
                            @{profile.userId.username}
                          </p>
                          {profile.currentPost && (
                            <p className={styles.profileHeadline}>
                              {profile.currentPost}
                            </p>
                          )}
                        </div>

                        <div className={styles.arrowIcon}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {authState.all_profiles_fetched && authState.all_users.length > 5 && (
                <button
                  type="button"
                  className={styles.seeAllBtn}
                  onClick={() => router.push("/discover")}
                >
                  See All ({authState.all_users.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className={styles.mobileNavbar}>
        <div
          onClick={() => {
            router.push("/dashboard");
          }}
          className={styles.singleNavItemHolder_mobileView}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </div>

        <div
          onClick={() => {
            router.push("/discover");
          }}
          className={styles.singleNavItemHolder_mobileView}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <div
          onClick={() => {
            router.push("/my_connections");
          }}
          className={styles.singleNavItemHolder_mobileView}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
