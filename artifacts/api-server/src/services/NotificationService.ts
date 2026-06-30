import { db, notificationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

type NotifType = "welcome" | "subscription" | "system" | "holiday";

interface NotifPayload {
  userId: string;
  type: NotifType;
  title: string;
  message: string;
  isRead?: boolean;
  link?: string;
}

// ── Indian Holiday Calendar ────────────────────────────────────────────────────
// Format: "MM-DD" — year-agnostic recurring holidays
// Plus Diwali, Holi, Eid, Dussehra are lunisolar; approximated for current years

interface IndianHoliday {
  name: string;
  emoji: string;
  greeting: (name: string) => string;
  message: string;
  // "MM-DD" for fixed Gregorian holidays, or an array of "YYYY-MM-DD" for lunisolar ones
  dates: string[];
}

const INDIAN_HOLIDAYS: IndianHoliday[] = [
  {
    name: "New Year's Day",
    emoji: "🎆",
    greeting: (n) => `Happy New Year, ${n}! 🎆`,
    message: "Wishing you a brilliant new year filled with success, productivity, and happiness. May all your documents and dreams be perfectly in order! — Team FileNova",
    dates: ["01-01"],
  },
  {
    name: "Makar Sankranti",
    emoji: "🪁",
    greeting: (n) => `Happy Makar Sankranti, ${n}! 🪁`,
    message: "May this auspicious festival mark the beginning of new opportunities and prosperity for you. Enjoy the kites, til-gul, and sweet moments! — Team FileNova",
    dates: ["01-14"],
  },
  {
    name: "Republic Day",
    emoji: "🇮🇳",
    greeting: (n) => `Happy Republic Day, ${n}! 🇮🇳`,
    message: "On this proud day, we salute the spirit of our Constitution and the unity of India. May our nation continue to grow in strength and harmony. Jai Hind! — Team FileNova",
    dates: ["01-26"],
  },
  {
    name: "Holi",
    emoji: "🎨",
    greeting: (n) => `Happy Holi, ${n}! 🎨`,
    message: "May the colours of Holi fill your life with joy, love, and vibrant energy! Wishing you and your family a wonderful and colourful celebration. — Team FileNova",
    // Lunisolar: approximate Gregorian dates for near years
    dates: ["2025-03-14", "2026-03-03", "2027-03-22", "2028-03-11"],
  },
  {
    name: "Good Friday",
    emoji: "✝️",
    greeting: (n) => `Good Friday greetings, ${n}! ✝️`,
    message: "On this solemn day of reflection and hope, we wish you peace and strength. — Team FileNova",
    dates: ["2025-04-18", "2026-04-03", "2027-03-26", "2028-04-14"],
  },
  {
    name: "Eid ul-Fitr",
    emoji: "🌙",
    greeting: (n) => `Eid Mubarak, ${n}! 🌙`,
    message: "May this blessed Eid bring peace, prosperity, and joy to you and your loved ones. Eid Mubarak from all of us at FileNova! — Team FileNova",
    dates: ["2025-03-31", "2026-03-20", "2027-03-09", "2028-03-28"],
  },
  {
    name: "Eid ul-Adha",
    emoji: "🐑",
    greeting: (n) => `Eid ul-Adha Mubarak, ${n}! 🐑`,
    message: "Wishing you and your family the blessings of sacrifice, faith, and love on this holy occasion. Eid Mubarak! — Team FileNova",
    dates: ["2025-06-07", "2026-05-27", "2027-05-17", "2028-05-05"],
  },
  {
    name: "Independence Day",
    emoji: "🇮🇳",
    greeting: (n) => `Happy Independence Day, ${n}! 🇮🇳`,
    message: "78 years of freedom, democracy, and dreams. Today we celebrate the pride of being Indian. May India continue to shine and inspire the world. Jai Hind! — Team FileNova",
    dates: ["08-15"],
  },
  {
    name: "Janmashtami",
    emoji: "🪈",
    greeting: (n) => `Happy Janmashtami, ${n}! 🪈`,
    message: "May the divine blessings of Lord Krishna bring you wisdom, love, and everlasting joy. Wishing you and your family a joyful celebration! — Team FileNova",
    dates: ["2025-08-16", "2026-08-05", "2027-08-24", "2028-08-12"],
  },
  {
    name: "Ganesh Chaturthi",
    emoji: "🐘",
    greeting: (n) => `Ganesh Chaturthi Wishes, ${n}! 🐘`,
    message: "May Lord Ganesha, the remover of obstacles, bless you with wisdom, prosperity, and success in everything you do. Ganpati Bappa Morya! — Team FileNova",
    dates: ["2025-08-27", "2026-09-15", "2027-09-05", "2028-08-23"],
  },
  {
    name: "Dussehra (Vijayadashami)",
    emoji: "🏹",
    greeting: (n) => `Happy Dussehra, ${n}! 🏹`,
    message: "May this day of triumph of good over evil bring victory to all your endeavours. May Maa Durga's blessings be with you always! — Team FileNova",
    dates: ["2025-10-02", "2026-10-21", "2027-10-10", "2028-10-28"],
  },
  {
    name: "Gandhi Jayanti",
    emoji: "🕊️",
    greeting: (n) => `Gandhi Jayanti Greetings, ${n}! 🕊️`,
    message: "On the birth anniversary of the Father of the Nation, let us recommit to truth, non-violence, and service. Bapu's ideals live in every one of us. — Team FileNova",
    dates: ["10-02"],
  },
  {
    name: "Diwali",
    emoji: "🪔",
    greeting: (n) => `Happy Diwali, ${n}! 🪔`,
    message: "May the festival of lights illuminate your life with joy, success, and prosperity. Wishing you and your family a sparkling Diwali and a wonderful New Year! — Team FileNova",
    dates: ["2025-10-20", "2026-11-08", "2027-10-28", "2028-10-17"],
  },
  {
    name: "Guru Nanak Jayanti",
    emoji: "☬",
    greeting: (n) => `Guru Nanak Jayanti Greetings, ${n}! ☬`,
    message: "On the auspicious occasion of Gurpurab, may Guru Nanak Dev Ji's teachings of compassion and equality inspire your life. Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh! — Team FileNova",
    dates: ["2025-11-05", "2026-11-24", "2027-11-14", "2028-11-02"],
  },
  {
    name: "Christmas",
    emoji: "🎄",
    greeting: (n) => `Merry Christmas, ${n}! 🎄`,
    message: "Wishing you a season full of warmth, love, and cheer! May this Christmas bring you the joy of family, the gift of friends, and the wonder of hope. — Team FileNova",
    dates: ["12-25"],
  },
];


// Plan display labels
const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
  pass_24h: "24-Hour Pass",
  pass_7d: "7-Day Pass",
};

// Per-plan appreciation messages
const PLAN_MESSAGES: Record<string, { title: (name: string) => string; message: string }> = {
  basic: {
    title: (name) => `Welcome to Basic, ${name}! 🎉`,
    message:
      "Thank you for upgrading to the Basic plan! You now have higher file size limits (15MB), 20 operations per day, and priority processing. We're thrilled to have you on board — enjoy faster, smarter document work!",
  },
  pro: {
    title: (name) => `You're now Pro, ${name}! ⚡`,
    message:
      "Amazing — thank you for choosing the Pro plan! You have unlocked unlimited operations, 50MB uploads, AI-powered tools, and all premium features. We appreciate your trust in FileNova. Let's get things done!",
  },
  elite: {
    title: (name) => `Elite Member, ${name}! 👑`,
    message:
      "Welcome to the Elite tier — thank you for your incredible support! You have the highest file limit (100MB), unlimited everything, priority support, and exclusive early access to new features. You are the reason FileNova keeps growing!",
  },
  pass_24h: {
    title: (name) => `Your 24-Hour Pass is active, ${name}! ⏱️`,
    message:
      "Thanks for grabbing the 24-Hour Pass! You have full Pro-level access for the next 24 hours — make the most of it with unlimited tools, AI features, and fast processing. We hope to see you on a longer plan soon!",
  },
  pass_7d: {
    title: (name) => `7-Day Pass activated, ${name}! 🗓️`,
    message:
      "Thank you for choosing the 7-Day Pass! Enjoy a full week of Pro-level access with unlimited operations, AI tools, and premium features. We hope you love the experience — a monthly plan is always just one click away!",
  },
};

export class NotificationService {
  /**
   * Get the display name of a user, falling back gracefully.
   */
  private static async getUserName(userId: string): Promise<string> {
    try {
      const [user] = await db.select({ name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
      if (user?.name) return user.name.trim().split(" ")[0]; // Use first name only
      if (user?.email) return user.email.split("@")[0];
    } catch {
      // Silently fall back
    }
    return "there";
  }

  /**
   * Insert a notification row silently — never throws.
   */
  private static async insert(payload: NotifPayload): Promise<void> {
    try {
      await db.insert(notificationsTable).values({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        isRead: payload.isRead ?? false,
        link: payload.link ?? null,
      });
    } catch (err) {
      logger.error({ err, userId: payload.userId }, "Failed to insert notification");
    }
  }

  /**
   * Seed welcome notification for a newly registered user.
   */
  public static async sendWelcome(userId: string, userName?: string | null): Promise<void> {
    const name = userName?.trim().split(" ")[0] || await NotificationService.getUserName(userId);
    await NotificationService.insert({
      userId,
      type: "welcome",
      title: `Welcome to FileNova AI, ${name}! 🚀`,
      message:
        "We're so glad you're here! FileNova is your AI-powered document productivity platform — compress PDFs, convert images, extract text, and so much more. All your files stay private and never leave your device for standalone tools. Let's get started!",
      link: "/workspace",
    });
  }

  /**
   * Seed a subscription upgrade notification after a plan is activated.
   */
  public static async sendSubscriptionUpgrade(userId: string, plan: string): Promise<void> {
    const name = await NotificationService.getUserName(userId);
    const template = PLAN_MESSAGES[plan];
    if (!template) {
      // Generic fallback for unknown plans
      const planLabel = PLAN_LABELS[plan] || plan.charAt(0).toUpperCase() + plan.slice(1);
      await NotificationService.insert({
        userId,
        type: "subscription",
        title: `Plan activated: ${planLabel} 🎊`,
        message: `Hi ${name}! Your ${planLabel} plan is now active. Thank you for upgrading — enjoy your new features!`,
        link: "/pricing",
      });
      return;
    }
    await NotificationService.insert({
      userId,
      type: "subscription",
      title: template.title(name),
      message: template.message,
      link: "/pricing",
    });
  }

  /**
   * Determine if today (in IST) is an Indian holiday. Returns the holiday or null.
   */
  public static getTodayHoliday(): IndianHoliday | null {
    // Use IST (UTC+5:30)
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const year = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayFull = `${year}-${mm}-${dd}`; // "YYYY-MM-DD"
    const todayShort = `${mm}-${dd}`;         // "MM-DD"

    for (const holiday of INDIAN_HOLIDAYS) {
      for (const d of holiday.dates) {
        if (d === todayFull || d === todayShort) {
          return holiday;
        }
      }
    }
    return null;
  }

  /**
   * Send holiday greetings to all users for today's holiday (if any).
   * Should be called once per day, early morning IST.
   */
  public static async sendDailyHolidayGreetings(): Promise<void> {
    const holiday = NotificationService.getTodayHoliday();
    if (!holiday) return; // Not a holiday today

    logger.info({ holiday: holiday.name }, "Sending holiday greetings to all users");

    try {
      // Fetch all users with name + id
      const users = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email }).from(usersTable);

      let sent = 0;
      let failed = 0;

      for (const user of users) {
        try {
          const firstName = user.name?.trim().split(" ")[0] || user.email?.split("@")[0] || "there";
          await NotificationService.insert({
            userId: user.id,
            type: "holiday",
            title: holiday.greeting(firstName),
            message: holiday.message,
            link: "/",
          });
          sent++;
        } catch {
          failed++;
        }
      }

      logger.info({ holiday: holiday.name, sent, failed }, "Holiday greetings dispatched");
    } catch (err) {
      logger.error({ err }, "Failed to send daily holiday greetings");
    }
  }
}
