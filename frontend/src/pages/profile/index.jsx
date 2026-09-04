import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import styles from "./index.module.css";
import { getAboutUser } from "@/config/redux/action/authAction";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import { BASE_URL, clientServer } from "@/config";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

  // Modal Inputs
  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });
  const [inputEducationData, setInputEducationData] = useState({
    school: "",
    degree: "",
    fieldOfStudy: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target;
    setInputEducationData({ ...inputEducationData, [name]: value });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getAllPosts());
    }
  }, [dispatch]);

  useEffect(() => {
    if (authState.user && authState.user.userId) {
      setUserProfile(authState.user);

      if (postReducer.posts && postReducer.posts.length > 0) {
        const posts = postReducer.posts.filter(
          (p) => p.userId?.username === authState.user.userId?.username
        );
        setUserPosts(posts);
      }
    }
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    if (!file) return;
    setIsUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("token", localStorage.getItem("token"));
      await clientServer.post("/update_profile_picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile picture:", err);
    } finally {
      setIsUploadingPic(false);
    }
  };

  const updateProfileData = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      await clientServer.post("/user_update", {
        token,
        name: userProfile.userId.name,
      });

      await clientServer.post("/update_profile_data", {
        token,
        bio: userProfile.bio || "",
        currentPost: userProfile.currentPost || "",
        pastWork: userProfile.pastWork || [],
        education: userProfile.education || [],
      });

      await dispatch(getAboutUser({ token }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const profilePicUrl = userProfile?.userId?.profilePicture
    ? `${BASE_URL}/${userProfile.userId.profilePicture}`
    : null;

  const userInitial = userProfile?.userId?.name
    ? userProfile.userId.name.charAt(0).toUpperCase()
    : "U";

  return (
    <UserLayout>
      <DashboardLayout>
        {userProfile && userProfile.userId ? (
          <div className={styles.profileWrapper}>
            {/* Hero Card */}
            <div className={styles.heroCard}>
              {/* Cover Banner */}
              <div className={styles.coverBanner}>
                <div className={styles.coverPattern} />
                <span className={styles.coverBadge}>Profile Overview</span>
              </div>

              {/* Profile Header Body */}
              <div className={styles.profileHeaderBody}>
                {/* Avatar & Action Row */}
                <div className={styles.avatarActionRow}>
                  {/* Avatar with Edit Overlay */}
                  <label htmlFor="profilePictureUpload" className={styles.avatarWrapper}>
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
                    <div className={styles.avatarOverlay} title="Change profile picture">
                      {isUploadingPic ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
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
                              d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                            />
                          </svg>
                          <span>Edit</span>
                        </>
                      )}
                    </div>
                  </label>

                  <input
                    id="profilePictureUpload"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => updateProfilePicture(e.target.files[0])}
                  />

                  {/* Header Actions */}
                  <div className={styles.headerButtons}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() =>
                        router.push(`/view_profile/${userProfile.userId.username}`)
                      }
                      title="See your public view profile"
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
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                      <span>View Public Profile</span>
                    </button>

                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={updateProfileData}
                      disabled={isSaving}
                      title="Save your profile updates"
                    >
                      {isSaving ? (
                        <span>Saving...</span>
                      ) : (
                        <>
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
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Identity Information */}
                <div className={styles.identityGroup}>
                  <div className={styles.nameRow}>
                    <input
                      className={styles.nameInput}
                      type="text"
                      value={userProfile.userId?.name || ""}
                      placeholder="Your Full Name"
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                      title="Click to edit your display name"
                    />
                    <span className={styles.usernameTag}>
                      @{userProfile.userId?.username}
                    </span>
                  </div>

                  {/* Headline / Current Role Input */}
                  <div className={styles.headlineInputWrapper}>
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
                    <input
                      type="text"
                      className={styles.headlineInput}
                      placeholder="Add a headline (e.g. Senior Software Engineer at Nexora)"
                      value={userProfile.currentPost || ""}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          currentPost: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About / Bio Section */}
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
              <textarea
                className={styles.bioTextarea}
                placeholder="Write a brief bio introducing yourself, your passions, and achievements..."
                value={userProfile.bio || ""}
                onChange={(e) => {
                  setUserProfile({ ...userProfile, bio: e.target.value });
                }}
                rows={4}
              />
              <div className={styles.textareaHint}>
                {(userProfile.bio || "").length} characters
              </div>
            </div>

            {/* Experience / Work History Section */}
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
                <button
                  type="button"
                  className={styles.btnAddItem}
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Add Experience</span>
                </button>
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
                      <button
                        type="button"
                        className={styles.btnRemoveItem}
                        onClick={() => {
                          const updated = userProfile.pastWork.filter((_, i) => i !== index);
                          setUserProfile({ ...userProfile, pastWork: updated });
                        }}
                        title="Remove this experience"
                      >
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
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
                  <p className={styles.emptyText}>No experience added yet</p>
                  <p className={styles.emptySubtext}>
                    Click "Add Experience" to list your professional roles.
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
                <button
                  type="button"
                  className={styles.btnAddItem}
                  onClick={() => setIsEducationModalOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span>Add Education</span>
                </button>
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
                      <button
                        type="button"
                        className={styles.btnRemoveItem}
                        onClick={() => {
                          const updated = userProfile.education.filter((_, i) => i !== index);
                          setUserProfile({ ...userProfile, education: updated });
                        }}
                        title="Remove this education"
                      >
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
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
                  <p className={styles.emptyText}>No education added yet</p>
                  <p className={styles.emptySubtext}>
                    Click "Add Education" to include your school or degrees.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity / Posts Section */}
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
                  <p className={styles.emptyText}>No posts shared yet</p>
                  <p className={styles.emptySubtext}>
                    Share your thoughts and projects from the feed to showcase your activity.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Modal: Add Work Experience */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <div className={styles.modalIcon}>
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
                  <h3 className={styles.modalTitle}>Add Experience</h3>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Company</label>
                  <input
                    onChange={handleWorkInputChange}
                    value={inputData.company}
                    name="company"
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Google, Stripe, or Startup"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Position / Role</label>
                  <input
                    onChange={handleWorkInputChange}
                    value={inputData.position}
                    name="position"
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Software Engineer, Product Designer"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Years / Duration</label>
                  <input
                    onChange={handleWorkInputChange}
                    value={inputData.years}
                    name="years"
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. 2, 2021 - 2023"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnSubmit}
                  onClick={() => {
                    if (!inputData.company || !inputData.position) return;
                    setUserProfile({
                      ...userProfile,
                      pastWork: [...(userProfile.pastWork || []), inputData],
                    });
                    setInputData({ company: "", position: "", years: "" });
                    setIsModalOpen(false);
                  }}
                >
                  Add Experience
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Education */}
        {isEducationModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsEducationModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <div className={styles.modalIcon}>
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
                  <h3 className={styles.modalTitle}>Add Education</h3>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setIsEducationModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>School / University</label>
                  <input
                    onChange={handleEducationInputChange}
                    value={inputEducationData.school}
                    name="school"
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Stanford University, MIT"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Degree</label>
                  <input
                    onChange={handleEducationInputChange}
                    value={inputEducationData.degree}
                    name="degree"
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Bachelor of Science, Master's"
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.formLabel}>Field of Study / Years</label>
                  <input
                    onChange={handleEducationInputChange}
                    value={inputEducationData.fieldOfStudy}
                    name="fieldOfStudy"
                    className={styles.formInput}
                    type="text"
                    placeholder="e.g. Computer Science (2020 - 2024)"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setIsEducationModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.btnSubmit}
                  onClick={() => {
                    if (!inputEducationData.school || !inputEducationData.degree) return;
                    setUserProfile({
                      ...userProfile,
                      education: [...(userProfile.education || []), inputEducationData],
                    });
                    setInputEducationData({ school: "", degree: "", fieldOfStudy: "" });
                    setIsEducationModalOpen(false);
                  }}
                >
                  Add Education
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {saveSuccess && (
          <div className={styles.toastNotification}>
            <svg
              className={styles.toastSuccessIcon}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <span>Profile saved successfully!</span>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
