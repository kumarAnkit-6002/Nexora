import { getAllUsers } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";

export default function DiscoverPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  const filteredUsers = useMemo(() => {
    if (!authState.all_users) return [];
    if (!searchTerm.trim()) return authState.all_users;

    const term = searchTerm.toLowerCase().trim();
    return authState.all_users.filter((profile) => {
      const nameMatch = profile.userId?.name
        ?.toLowerCase()
        .includes(term);
      const usernameMatch = profile.userId?.username
        ?.toLowerCase()
        .includes(term);
      return nameMatch || usernameMatch;
    });
  }, [authState.all_users, searchTerm]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Header Card with Search Input */}
          <div className={styles.headerCard}>
            <div className={styles.headerTop}>
              <div className={styles.titleGroup}>
                <h1 className={styles.pageTitle}>
                  <div className={styles.pageTitleIcon}>
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
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                  Discover People
                </h1>
                <p className={styles.pageSubtitle}>
                  Search and connect with creators, professionals, and colleagues on Nexora.
                </p>
              </div>

              {authState.all_profiles_fetched && (
                <span className={styles.countBadge}>
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "Member" : "Members"}
                  {searchTerm.trim() ? " found" : ""}
                </span>
              )}
            </div>

            {/* Search Bar */}
            <div className={styles.searchBarWrapper}>
              <svg
                className={styles.searchIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>

              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name or @username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm.length > 0 && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Members Content */}
          {!authState.all_profiles_fetched ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Discovering members...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className={styles.allUserProfile}>
              {filteredUsers.map((profile) => {
                if (!profile.userId) return null;

                const isCurrentUser =
                  authState.user?.userId?.username === profile.userId.username;

                const profilePicUrl = profile.userId.profilePicture
                  ? `${BASE_URL}/${profile.userId.profilePicture}`
                  : null;

                const initial = profile.userId.name
                  ? profile.userId.name.charAt(0).toUpperCase()
                  : "U";

                return (
                  <div
                    key={profile._id}
                    className={styles.userCard}
                    onClick={() => {
                      router.push(`/view_profile/${profile.userId.username}`);
                    }}
                  >
                    <div>
                      <div className={styles.cardTop}>
                        {/* Avatar */}
                        <div className={styles.avatarWrapper}>
                          {profilePicUrl ? (
                            <img
                              className={styles.userCard_image}
                              src={profilePicUrl}
                              alt={profile.userId.name}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className={styles.avatarFallback}>{initial}</div>
                          )}
                        </div>

                        {/* Name & Handle */}
                        <div className={styles.cardInfo}>
                          <div className={styles.userNameRow}>
                            <h3 className={styles.userName}>
                              {profile.userId.name}
                            </h3>
                            {isCurrentUser && (
                              <span className={styles.youBadge}>You</span>
                            )}
                          </div>
                          <p className={styles.userHandle}>
                            @{profile.userId.username}
                          </p>
                          {profile.currentPost && (
                            <p className={styles.userHeadline}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.8}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                                />
                              </svg>
                              {profile.currentPost}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bio preview if available */}
                      {profile.bio && (
                        <p className={styles.cardBio}>{profile.bio}</p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className={styles.cardFooter}>
                      <span className={styles.viewProfileLink}>
                        View Profile
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
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconBox}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>No members found</h3>
              <p className={styles.emptySubtitle}>
                We couldn't find any profiles matching "{searchTerm}". Try searching
                with a different name or username.
              </p>
              <button
                type="button"
                className={styles.btnClearFilter}
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
