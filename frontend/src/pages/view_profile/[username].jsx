import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyConnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);
  const [isConnectionPending, setIsConnectionPending] = useState(true);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAllPosts());
      dispatch(getConnectionsRequest({ token }));
      dispatch(getMyConnectionRequests({ token }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (postReducer.posts && router.query.username) {
      const filteredPosts = postReducer.posts.filter(
        (post) => post.userId?.username === router.query.username
      );
      setUserPosts(filteredPosts);
    }
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    if (!userProfile?.userId?._id) return;
    const targetUserId = userProfile.userId._id;

    // Check in accepted or sent connections
    const sentConn = (authState.connections || []).find(
      (user) => user.connectionId?._id === targetUserId
    );
    if (sentConn) {
      setIsCurrentUserInConnection(true);
      setIsConnectionPending(!sentConn.status_accepted);
      return;
    }

    // Check in received connection requests
    const recConn = (authState.connectionRequest || []).find(
      (user) => user.userId?._id === targetUserId
    );
    if (recConn) {
      setIsCurrentUserInConnection(true);
      setIsConnectionPending(!recConn.status_accepted);
      return;
    }

    setIsCurrentUserInConnection(false);
    setIsConnectionPending(true);
  }, [authState.connections, authState.connectionRequest, userProfile]);

  const handleDownloadResume = async () => {
    if (!userProfile?.userId?._id) return;
    setIsDownloadingResume(true);
    try {
      const response = await clientServer.get(
        `/user/download_resume?id=${userProfile.userId._id}`
      );
      if (response.data?.message) {
        window.open(`${BASE_URL}/${response.data.message}`, "_blank");
      }
    } catch (error) {
      console.error("Error downloading resume:", error);
    } finally {
      setIsDownloadingResume(false);
    }
  };

  if (!userProfile || !userProfile.userId) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.notFoundContainer}>
            <div className={styles.notFoundIcon}>
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
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h2 className={styles.notFoundTitle}>User Not Found</h2>
            <p className={styles.notFoundText}>
              The profile you are looking for does not exist or has been removed.
            </p>
            <button
              className={styles.connectBtn}
              onClick={() => router.push("/dashboard")}
            >
              Return to Dashboard
            </button>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const isOwnProfile =
    authState.user?.userId?.username === userProfile.userId.username;

  const profilePicUrl = userProfile.userId.profilePicture
    ? `${BASE_URL}/${userProfile.userId.profilePicture}`
    : null;

  const userInitial = userProfile.userId.name
    ? userProfile.userId.name.charAt(0).toUpperCase()
    : "U";

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.profileWrapper}>
          {/* Hero Card */}
          <div className={styles.heroCard}>
            {/* Cover Banner */}
            <div className={styles.coverBanner}>
              <div className={styles.coverPattern} />
              <span className={styles.coverBadge}>Member Profile</span>
            </div>

            {/* Profile Header Body */}
            <div className={styles.profileHeaderBody}>
              <div className={styles.avatarActionRow}>
                {/* Avatar */}
                <div className={styles.avatarWrapper}>
                  {profilePicUrl ? (
                    <img
                      src={profilePicUrl}
                      alt={userProfile.userId.name}
                      className={styles.avatarImg}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>{userInitial}</div>
                  )}
                </div>

                {/* Header Action Buttons */}
                <div className={styles.headerButtons}>
                  {isOwnProfile ? (
                    <button
                      type="button"
                      className={styles.editProfileBtn}
                      onClick={() => router.push("/profile")}
                    >
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
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <>
                      {isCurrentUserInConnection ? (
                        isConnectionPending ? (
                          <div className={styles.pendingBadge}>
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
                                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                            <span>Request Pending</span>
                          </div>
                        ) : (
                          <div className={styles.connectedBadge}>
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
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                            <span>Connected</span>
                          </div>
                        )
                      ) : (
                        <button
                          type="button"
                          className={styles.connectBtn}
                          onClick={() => {
                            const token = localStorage.getItem("token");
                            if (token && userProfile?.userId?._id) {
                              dispatch(
                                sendConnectionRequest({
                                  token,
                                  user_id: userProfile.userId._id,
                                })
                              );
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            style={{ width: 18, height: 18 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.765Z"
                            />
                          </svg>
                          <span>Connect</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Resume Download */}
                  <button
                    type="button"
                    className={styles.resumeBtn}
                    onClick={handleDownloadResume}
                    disabled={isDownloadingResume}
                    title="Download generated resume PDF"
                  >
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
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    <span>{isDownloadingResume ? "Generating..." : "Resume PDF"}</span>
                  </button>
                </div>
              </div>

              {/* User Identity */}
              <div className={styles.identityGroup}>
                <div className={styles.nameRow}>
                  <h2 className={styles.profileName}>{userProfile.userId.name}</h2>
                  <span className={styles.usernameTag}>
                    @{userProfile.userId.username}
                  </span>
                </div>

                {userProfile.currentPost && (
                  <div className={styles.headlineRow}>
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
                    <span>{userProfile.currentPost}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          {userProfile.bio && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <div className={styles.sectionIconBox}>
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
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </div>
                  <h3 className={styles.sectionTitle}>About</h3>
                </div>
              </div>
              <p className={styles.bioText}>{userProfile.bio}</p>
            </div>
          )}

          {/* Work Experience Section */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconBox}>
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
                </div>
                <h3 className={styles.sectionTitle}>Work Experience</h3>
              </div>
            </div>

            {userProfile.pastWork && userProfile.pastWork.length > 0 ? (
              <div className={styles.itemList}>
                {userProfile.pastWork.map((work, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemIconCircle}>
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
                          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                        />
                      </svg>
                    </div>
                    <div className={styles.itemContent}>
                      <h4 className={styles.itemMainTitle}>{work.position}</h4>
                      <p className={styles.itemSubTitle}>{work.company}</p>
                      {work.years && (
                        <span className={styles.itemMetaBadge}>
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
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          {work.years} {work.years === "1" ? "year" : "years"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
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
                </div>
                <p className={styles.emptyText}>No experience listed</p>
                <p className={styles.emptySubtext}>
                  This user has not added any work experience yet.
                </p>
              </div>
            )}
          </div>

          {/* Education History Section */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconBox}>
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
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7 4.5v-2.25"
                    />
                  </svg>
                </div>
                <h3 className={styles.sectionTitle}>Education</h3>
              </div>
            </div>

            {userProfile.education && userProfile.education.length > 0 ? (
              <div className={styles.itemList}>
                {userProfile.education.map((edu, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemIconCircle}>
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
                          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7 4.5v-2.25"
                        />
                      </svg>
                    </div>
                    <div className={styles.itemContent}>
                      <h4 className={styles.itemMainTitle}>{edu.school}</h4>
                      <p className={styles.itemSubTitle}>{edu.degree}</p>
                      {edu.fieldOfStudy && (
                        <span className={styles.itemMetaBadge}>{edu.fieldOfStudy}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
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
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7 4.5v-2.25"
                    />
                  </svg>
                </div>
                <p className={styles.emptyText}>No education listed</p>
                <p className={styles.emptySubtext}>
                  This user has not listed their academic background yet.
                </p>
              </div>
            )}
          </div>

          {/* Recent Posts Section */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleGroup}>
                <div className={styles.sectionIconBox}>
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
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                    />
                  </svg>
                </div>
                <h3 className={styles.sectionTitle}>Recent Posts</h3>
              </div>
            </div>

            {userPosts && userPosts.length > 0 ? (
              <div className={styles.activityGrid}>
                {userPosts.map((post) => (
                  <div key={post._id} className={styles.postCard}>
                    {post.media && (
                      <img
                        src={`${BASE_URL}/${post.media}`}
                        alt="Post attachment"
                        className={styles.postMedia}
                      />
                    )}
                    <div className={styles.postBody}>
                      <p className={styles.postText}>{post.body}</p>
                      <div className={styles.postFooter}>
                        <span className={styles.postLikes}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                          </svg>
                          {post.likes ? post.likes : 0} likes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
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
                      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                    />
                  </svg>
                </div>
                <p className={styles.emptyText}>No recent activity</p>
                <p className={styles.emptySubtext}>
                  This user hasn't posted any updates yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: {
          username: context.query.username,
        },
      }
    );
    return { props: { userProfile: request.data?.profile || null } };
  } catch (error) {
    console.error("Error fetching user profile in SSR:", error);
    return { props: { userProfile: null } };
  }
}
