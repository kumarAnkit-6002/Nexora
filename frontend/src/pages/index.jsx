import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
import UserLayout from "@/layout/UserLayout";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      setHasToken(true);
    }
  }, []);

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>

            <p>A True social media platform , with stories no blufs !</p>

            <div
              onClick={() => {
                if (hasToken) {
                  router.push("/dashboard");
                } else {
                  router.push("/login");
                }
              }}
              className={styles.buttonJoin}
            >
              {hasToken ? "Go to Dashboard" : "Join Now"}
            </div>
          </div>
          <div className={styles.mainContainer_right}>
            <img
              src="images/Homemain_page.jpg"
              alt=""
              width="300px"
              height="300px"
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
