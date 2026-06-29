import { Switch, Route, Redirect, useLocation } from "wouter";
import React, { useEffect, useRef } from "react";
import { BACKEND_URL, HAS_BACKEND } from "@/lib/api";
import Home from "@/pages/SimpleHome";
const Workspace = React.lazy(() => import("@/pages/Home"));
import ToolsPage from "@/pages/ToolsPage";
import ToolPage from "@/pages/ToolPage";
import { ToolSEO } from "@/seo/ToolSEO";
import { ToolStructuredData } from "@/seo/ToolStructuredData";
import { EventTheme } from "@/components/events/EventTheme";
import { NoticeBar } from "@/components/events/NoticeBar";
import { AnimatedBanner } from "@/components/events/AnimatedBanner";
import { NewsTicker } from "@/components/events/NewsTicker";
import { ThemeEffects } from "@/components/ThemeEffects";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAdmin } from "@/lib/admin";
import { useAuthStore } from "@/store/useAuthStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized, fetchMe } = useAuthStore();
  const [location] = useLocation();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (initialized && !user && !restoredRef.current) {
      const token = localStorage.getItem("filenova_token");
      if (token && !token.startsWith("local_")) {
        restoredRef.current = true;
        fetchMe();
      }
    }
  }, [initialized, user, fetchMe]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} replace />;
  }

  return <>{children}</>;
}


const MergePdf = React.lazy(() => import("@/pages/tools/MergePdf"));
const SplitPdf = React.lazy(() => import("@/pages/tools/SplitPdf"));
const CompressPdf = React.lazy(() => import("@/pages/tools/CompressPdf"));
const PdfToWord = React.lazy(() => import("@/pages/tools/PdfToWord"));
const PdfToJpg = React.lazy(() => import("@/pages/tools/PdfToJpg"));
const JpgToPdf = React.lazy(() => import("@/pages/tools/JpgToPdf"));
const RotatePdf = React.lazy(() => import("@/pages/tools/RotatePdf"));
const UnlockPdf = React.lazy(() => import("@/pages/tools/UnlockPdf"));
const ProtectPdf = React.lazy(() => import("@/pages/tools/ProtectPdf"));
const ResizePdf = React.lazy(() => import("@/pages/tools/ResizePdf"));
const PanCardResize = React.lazy(() => import("@/pages/tools/PanCardResize"));
const AadhaarMaskPdf = React.lazy(() => import("@/pages/tools/AadhaarMaskPdf"));
const GovernmentFormFill = React.lazy(() => import("@/pages/tools/GovernmentFormFill"));
const CompressPdfForUpload = React.lazy(() => import("@/pages/tools/CompressPdfForUpload"));
const Ocr = React.lazy(() => import("@/pages/tools/Ocr"));
const RemoveBackground = React.lazy(() => import("@/pages/tools/RemoveBackground"));
const ScholarshipZip = React.lazy(() => import("@/pages/tools/ScholarshipZip"));
const AiPdfSummary = React.lazy(() => import("@/pages/tools/AiPdfSummary"));
const ResizeImage = React.lazy(() => import("@/pages/tools/ResizeImage"));
const WordToPdf = React.lazy(() => import("@/pages/tools/WordToPdf"));
const AIPPTMakerWorkspace = React.lazy(() => import("@/tools/ai-ppt/AIPPTMakerWorkspace"));
const CompressImage = React.lazy(() => import("@/pages/tools/CompressImage"));
const CompressDoc = React.lazy(() => import("@/pages/tools/CompressDoc"));
const PdfToolsPage = React.lazy(() => import("@/pages/PdfToolsPage"));
const ImageToolsPage = React.lazy(() => import("@/pages/ImageToolsPage"));
const VideoToolsPage = React.lazy(() => import("@/pages/VideoToolsPage"));
const DocumentToolsPage = React.lazy(() => import("@/pages/DocumentToolsPage"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
const AdminUpiPayments = React.lazy(() => import("@/pages/AdminUpiPayments"));
const AdminCouponManagement = React.lazy(() => import("@/pages/AdminCouponManagement"));
const AdminDiscountCodes = React.lazy(() => import("@/pages/AdminDiscountCodes"));
const AdminLogin = React.lazy(() => import("@/pages/AdminLogin"));
const AdminAnalytics = React.lazy(() => import("@/pages/AdminAnalytics"));
const PremiumSuite = React.lazy(() => import("@/pages/PremiumSuite"));
const PricingPage = React.lazy(() => import("@/pages/PricingPage"));
const OperatorDashboard = React.lazy(() => import("@/pages/OperatorDashboard"));
const SEOPhotoCompressor = React.lazy(() => import("@/pages/seo/SEOPhotoCompressor"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

const BetaTestingZone = React.lazy(() => import("@/pages/BetaTestingZone"));
const DevWorkspace = React.lazy(() => import("@/pages/DevWorkspace"));
const LoginPage = React.lazy(() => import("@/pages/LoginPage"));
const DashboardPage = React.lazy(() => import("@/pages/DashboardPage"));
const HistoryPage = React.lazy(() => import("@/pages/HistoryPage"));
const BlogPage = React.lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = React.lazy(() => import("@/pages/BlogPostPage"));
const ReferralPage = React.lazy(() => import("@/pages/ReferralPage"));
const StudentOfferPage = React.lazy(() => import("@/pages/StudentOfferPage"));
const ResourcesPage = React.lazy(() => import("@/pages/ResourcesPage"));
const ContactPage = React.lazy(() => import("@/pages/Contact"));
const AboutPage = React.lazy(() => import("@/pages/About"));
const HelpPage = React.lazy(() => import("@/pages/Help"));
const WorkflowsPage = React.lazy(() => import("@/pages/WorkflowsPage"));
const IndiaToolsPage = React.lazy(() => import("@/pages/IndiaToolsPage"));
const ProfilePage = React.lazy(() => import("@/pages/ProfilePage"));
const PrivacyPolicy = React.lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("@/pages/TermsOfService"));
const CookiePolicy = React.lazy(() => import("@/pages/CookiePolicy"));

function ReferralRedirect({ code: propCode }: { code?: string }) {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = propCode || searchParams.get("code") || searchParams.get("ref");

    if (code) {
      // Self-referral bypass check
      if (user && user.referralCode === code) {
        setLocation(user.id.startsWith("local_") ? "/" : "/dashboard");
        return;
      }

      localStorage.setItem("filenova_referral_code", code);
      localStorage.setItem("referralCode", code);

      if (HAS_BACKEND) {
        fetch(`${BACKEND_URL}/api/v1/referral/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: code }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.referralId) {
              localStorage.setItem("filenova_referral_tracking_id", data.referralId);
            }
          })
          .catch(() => {});
      }
    }
    setLocation("/login");
  }, [propCode, setLocation, user]);

  return <LoadingScreen />;
}

export function Router() {
  const { settings } = useAdmin();
  const [location] = useLocation();

  useEffect(() => {
    const classesToRemove = Array.from(document.documentElement.classList).filter(c => c.startsWith('event-theme-'));
    classesToRemove.forEach(c => document.documentElement.classList.remove(c));

    const isAdminPath = location.startsWith('/admin') || location.startsWith('/nova-control') || location.startsWith('/nova-login');

    if (!isAdminPath && settings.eventTheme && settings.eventTheme !== 'none') {
      document.documentElement.classList.add(`event-theme-${settings.eventTheme}`);
    }
  }, [settings.eventTheme, location]);

  return (
    <>
      <EventTheme />
      <NoticeBar />
      <NewsTicker />
      <AnimatedBanner placement="corner-decoration" />
      <AnimatedBanner placement="background-overlay" />
      <ThemeEffects />
      <ScrollToTop />
      <ToolSEO />
      <ToolStructuredData />
      <React.Suspense fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/">
            <>
              <AnimatedBanner placement="hero" />
              <Home />
            </>
          </Route>
          <Route path="/workspace" component={Workspace} />
          <Route path="/tools" component={ToolsPage} />
          <Route path="/workflows">
            <WorkflowsPage />
          </Route>
          <Route path="/india-tools">
            <IndiaToolsPage />
          </Route>

          <Route path="/merge-pdf"><MergePdf /></Route>
          <Route path="/split-pdf"><SplitPdf /></Route>
          <Route path="/compress-pdf"><CompressPdf /></Route>
          <Route path="/pdf-to-word"><PdfToWord /></Route>
          <Route path="/pdf-to-jpg"><PdfToJpg /></Route>
          <Route path="/jpg-to-pdf"><JpgToPdf /></Route>
          <Route path="/rotate-pdf"><RotatePdf /></Route>
          <Route path="/unlock-pdf"><UnlockPdf /></Route>
          <Route path="/protect-pdf"><ProtectPdf /></Route>
          <Route path="/resize-pdf"><ResizePdf /></Route>
          <Route path="/pan-card-resize"><PanCardResize /></Route>
          <Route path="/aadhaar-mask-pdf"><AadhaarMaskPdf /></Route>
          <Route path="/government-form-fill"><GovernmentFormFill /></Route>
          <Route path="/compress-pdf-for-upload"><CompressPdfForUpload /></Route>
          <Route path="/ocr"><Ocr /></Route>
          <Route path="/remove-background"><RemoveBackground /></Route>
          <Route path="/scholarship-zip"><ScholarshipZip /></Route>
          <Route path="/ai-pdf-summary"><AiPdfSummary /></Route>
          <Route path="/resize-photo"><ResizeImage /></Route>
          <Route path="/word-to-pdf"><WordToPdf /></Route>
          <Route path="/ai-ppt-maker"><AIPPTMakerWorkspace /></Route>

          <Route path="/pdf-tools"><PdfToolsPage /></Route>
          <Route path="/image-tools"><ImageToolsPage /></Route>
          <Route path="/video-tools"><VideoToolsPage /></Route>
          <Route path="/document-tools"><DocumentToolsPage /></Route>

          <Route path="/aadhaar-mask"><Redirect to="/aadhaar-mask-pdf" /></Route>
          <Route path="/merge"><Redirect to="/merge-pdf" /></Route>
          <Route path="/compress"><Redirect to="/compress-pdf" /></Route>
          <Route path="/split"><Redirect to="/split-pdf" /></Route>
          <Route path="/resize-image"><Redirect to="/resize-photo" /></Route>
          <Route path="/compress-image"><CompressImage /></Route>
          <Route path="/compress-doc"><CompressDoc /></Route>
          <Route path="/document-converter"><Redirect to="/document-tools" /></Route>
          <Route path="/image-converter"><Redirect to="/image-tools" /></Route>
          <Route path="/ocr-pdf"><Redirect to="/ocr" /></Route>
          <Route path="/pdf-merge"><Redirect to="/merge-pdf" /></Route>
          <Route path="/image-to-pdf"><Redirect to="/jpg-to-pdf" /></Route>
          <Route path="/pdf-to-image"><Redirect to="/pdf-to-jpg" /></Route>
          <Route path="/careers"><Redirect to="/about" /></Route>
          <Route path="/changelog"><Redirect to="/blog" /></Route>
          <Route path="/status"><Redirect to="/contact" /></Route>
          <Route path="/api"><Redirect to="/resources" /></Route>

          <Route path="/tools/compress-pdf"><Redirect to="/compress-pdf" /></Route>
          <Route path="/tools/merge-pdf"><Redirect to="/merge-pdf" /></Route>
          <Route path="/tools/image-to-pdf"><Redirect to="/jpg-to-pdf" /></Route>
          <Route path="/tools/images-to-pdf"><Redirect to="/jpg-to-pdf" /></Route>
          <Route path="/tools/pdf-to-image"><Redirect to="/pdf-to-jpg" /></Route>
          <Route path="/tools/pdf-to-images"><Redirect to="/pdf-to-jpg" /></Route>
          <Route path="/tools/ocr"><Redirect to="/ocr" /></Route>
          <Route path="/tools/pdf-ocr"><Redirect to="/ocr" /></Route>
          <Route path="/tools/resize-image"><Redirect to="/resize-photo" /></Route>
          <Route path="/tools/resize-photo"><Redirect to="/resize-photo" /></Route>
          <Route path="/tools/compress-image"><Redirect to="/compress-image" /></Route>
          <Route path="/tools/compress-doc"><Redirect to="/compress-doc" /></Route>
          <Route path="/tools/word-to-pdf"><Redirect to="/word-to-pdf" /></Route>
          <Route path="/tools/docx-to-pdf"><Redirect to="/word-to-pdf" /></Route>
          <Route path="/tools/scholarship-zip"><Redirect to="/scholarship-zip" /></Route>
          <Route path="/tools/scholarship-zip-maker"><Redirect to="/scholarship-zip" /></Route>
          <Route path="/tools/scholarship"><Redirect to="/scholarship-zip" /></Route>
          <Route path="/tools/ai-pdf-summary"><Redirect to="/ai-pdf-summary" /></Route>
          <Route path="/tools/ai-summarize"><Redirect to="/ai-pdf-summary" /></Route>

          <Route path="/ai-background-remover"><Redirect to="/remove-background" /></Route>
          <Route path="/trim"><Redirect to="/tools/trim" /></Route>
          <Route path="/compress-video"><Redirect to="/video-tools" /></Route>
          <Route path="/video-to-audio"><Redirect to="/tools/video-to-audio" /></Route>
          <Route path="/video-to-gif"><Redirect to="/tools/video-to-gif" /></Route>
          <Route path="/compress-audio"><Redirect to="/tools/compress-audio" /></Route>
          <Route path="/tools/compress-pan-card">
            <SEOPhotoCompressor />
          </Route>
          <Route path="/tools/:toolId" component={ToolPage} />
          <Route path="/beta-test">
            <BetaTestingZone />
          </Route>
          <Route path="/dev">
            <DevWorkspace />
          </Route>
          <Route path="/premium">
            <PremiumSuite />
          </Route>
          <Route path="/pricing">
            <PricingPage />
          </Route>
          <Route path="/operator-dashboard">
            <OperatorDashboard />
          </Route>
          <Route path="/nova-control">
            <AdminDashboard />
          </Route>
          <Route path="/admin/analytics">
            <AdminAnalytics />
          </Route>
          <Route path="/admin/upi-payments">
            <AdminUpiPayments />
          </Route>
          <Route path="/admin/coupons">
            <AdminCouponManagement />
          </Route>
          <Route path="/admin/discount-codes">
            <AdminDiscountCodes />
          </Route>
          <Route path="/nova-login">
            <AdminLogin />
          </Route>
          <Route path="/login">
            <LoginPage />
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Route>
          <Route path="/history">
            <HistoryPage />
          </Route>
          <Route path="/blog/:slug">
            <BlogPostPage />
          </Route>
          <Route path="/blog">
            <BlogPage />
          </Route>
          <Route path="/referral">
            <ReferralPage />
          </Route>
          <Route path="/ref">
            <ReferralRedirect />
          </Route>
          <Route path="/ref/:code">
            {(params) => <ReferralRedirect code={params.code} />}
          </Route>
          <Route path="/student-offer">
            <StudentOfferPage />
          </Route>
          <Route path="/resources">
            <ResourcesPage />
          </Route>
          <Route path="/contact">
            <ContactPage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/help">
            <HelpPage />
          </Route>
          <Route path="/profile">
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Route>
          <Route path="/privacy">
            <PrivacyPolicy />
          </Route>
          <Route path="/terms">
            <TermsOfService />
          </Route>
          <Route path="/cookie-policy">
            <CookiePolicy />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </React.Suspense>
    </>
  );
}
