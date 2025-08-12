// src/onesignal.js
import { useUserStore } from '@/stores/user'

export function initOneSignal() {
  console.log("🔔 [OneSignal] Starting injection…");

  if (!document.querySelector('script[src*="OneSignalSDK.page.js"]')) {
    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;

    script.onload = () => {
      console.log("🔔 [OneSignal] SDK loaded, now initializing…");

      window.OneSignal = window.OneSignal || [];
      OneSignal.push(() => {
        OneSignal.init({
          appId: "e28c70ab-102a-4561-85ca-7b78ac9f4c3d",
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true,
          promptOptions: {
            slidedown: {
              enabled: true,
              actionMessage: "🎓 Stay updated with quizzes, alerts & study tools!",
              acceptButtonText: "Yes, notify me",
              cancelButtonText: "No thanks",
              text: {
                explanationText: "You can opt out anytime in your settings."
              }
            }
          }
        })
        .then(() => {
          console.log("✅ [OneSignal] Initialized successfully");

          const userStore = useUserStore();
          const user = userStore.user;

          if (user && user.email) {
            OneSignal.isPushNotificationsEnabled((isEnabled) => {
              if (isEnabled) {
                console.log("🔔 Already subscribed — no prompt needed.");
                return;
              }

              // ✅ 24-hour cooldown logic
              const now = Date.now();
              const lastPrompt = localStorage.getItem("lastOneSignalPrompt");
              const oneDay = 24 * 60 * 60 * 1000;

              if (!lastPrompt || now - Number(lastPrompt) > oneDay) {
                setTimeout(() => {
                  console.log("📬 Showing slidedown prompt via Pinia...");
                  OneSignal.showSlidedownPrompt();
                  localStorage.setItem("lastOneSignalPrompt", now.toString());
                }, 5000);
              } else {
                console.log("⏱️ Prompt was shown recently — skipping.");
              }
            });
          } else {
            console.log("⚠️ No logged-in user in Pinia. Skipping prompt.");
          }
        })
        .catch(err => {
          console.error("❌ [OneSignal] init error:", err);
        });
      });
    };

    script.onerror = (err) => {
      console.error("❌ [OneSignal] SDK load failed:", err);
    };

    document.head.appendChild(script);
  } else {
    console.log("ℹ️ [OneSignal] SDK already present");
  }
}
