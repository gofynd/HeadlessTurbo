import React, { Suspense, lazy } from "react";
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useFPI, RESERVED_PATH_SEGMENTS } from "fdk-core/utils";
import RootLayout from "./layouts/RootLayout";
import AuthCheck from "./components/AuthCheck";

const Home = lazy(() => import("./pages/home"));
const ProductListing = lazy(() => import("./pages/product-listing"));
const ProductDescription = lazy(() => import("./pages/product-description"));
const CartLanding = lazy(() => import("./pages/cart-landing"));
const SinglePageCheckout = lazy(() => import("./pages/single-page-checkout"));
const OrderStatus = lazy(() => import("./pages/order-status"));
const Brands = lazy(() => import("./pages/brands"));
const Categories = lazy(() => import("./pages/categories"));
const Collections = lazy(() => import("./pages/collections"));
const CollectionListing = lazy(() => import("./pages/collection-listing"));
const Wishlist = lazy(() => import("./pages/wishlist"));
const SharedCart = lazy(() => import("./pages/shared-cart"));
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const SetPassword = lazy(() => import("./pages/set-password"));
const AccountLocked = lazy(() => import("./pages/account-locked"));
const EditProfile = lazy(() => import("./pages/edit-profile"));
const Profile = lazy(() => import("./pages/profile"));
const ProfileDetails = lazy(() => import("./pages/profile-details"));
const ProfilePhone = lazy(() => import("./pages/profile-phone"));
const ProfileEmail = lazy(() => import("./pages/profile-email"));
const ProfileAddress = lazy(() => import("./pages/profile-address"));
const OrdersList = lazy(() => import("./pages/orders-list"));
const ShipmentDetails = lazy(() => import("./pages/shipment-details"));
const ShipmentUpdate = lazy(() => import("./pages/shipment-update"));
const VerifyEmail = lazy(() => import("./pages/verify-email"));
const VerifyEmailLink = lazy(() => import("./pages/verify-email-link"));
const Blog = lazy(() => import("./pages/blog"));
const BlogDetail = lazy(() => import("./pages/blog-detail"));
const ContactUs = lazy(() => import("./pages/contact-us"));
const AboutUs = lazy(() => import("./pages/about-us"));
const LocateUs = lazy(() => import("./pages/locate-us"));
const Faq = lazy(() => import("./pages/faq"));
const PrivacyPolicy = lazy(() => import("./pages/policy"));
const ShippingPolicy = lazy(() => import("./pages/shipping-policy"));
const ReturnPolicy = lazy(() => import("./pages/return-policy"));
const TermsAndConditions = lazy(() => import("./pages/tnc"));
const OrderTracking = lazy(() => import("./pages/order-tracking"));
const OrderTrackingDetails = lazy(
  () => import("./pages/order-tracking-details"),
);
const RefundOrder = lazy(() => import("./pages/refund-order"));
const ReturnSummaryStatus = lazy(() => import("./pages/return-summary-status"));
const RequestReattempt = lazy(() => import("./pages/request-reattempt"));
const PaymentLink = lazy(() => import("./pages/payment-link"));
const MarketingPage = lazy(
  () => import("./page-layouts/marketing/markting-page"),
);
const Compare = lazy(() => import("./page-layouts/compare/compare"));
const SectionsPage = lazy(
  () => import("./page-layouts/section-render/section-page"),
);
const FormItem = lazy(() => import("./components/FormItem"));
const NotFoundPage = lazy(() => import("./pages/not-found-page"));

// When user lands on /:slug (e.g. from PLP), redirect to canonical /product/:slug so the URL is correct.
// Reserved segments (blog, cart, etc.) show 404.
function ProductBySlugGate({ fpi }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Redirect to canonical PDP URL so address bar shows /product/:slug (hooks called unconditionally)
  React.useEffect(() => {
    if (!RESERVED_PATH_SEGMENTS.has(slug)) {
      navigate(`/product/${slug}`, { replace: true });
    }
  }, [slug, navigate]);

  if (RESERVED_PATH_SEGMENTS.has(slug)) {
    return <NotFoundPage fpi={fpi} />;
  }
  return null; // navigation will unmount this and load /product/:slug
}

function RenderWithFPI({ Component }) {
  const fpi = useFPI();
  return <AuthCheck Component={Component} fpi={fpi} />;
}

const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
    }}
  >
    <div
      style={{
        width: "32px",
        height: "32px",
        border: "3px solid #e0e0e0",
        borderTopColor: "#333",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function page(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <RenderWithFPI Component={Component} />
    </Suspense>
  );
}

// Get basename from environment for client-side routing
// This allows the app to work when deployed to a subpath (e.g., /app/)
// Set PUBLIC_URL environment variable if deploying to a subpath
function getBasename() {
  // Check environment variable first (for build-time configuration)
  if (typeof process !== "undefined" && process.env?.PUBLIC_URL) {
    const publicUrl = process.env.PUBLIC_URL.trim();
    // Remove trailing slash and ensure it starts with /
    if (publicUrl && publicUrl !== "/") {
      return publicUrl.replace(/\/$/, "");
    }
  }

  // For runtime detection (client-side only)
  if (typeof window !== "undefined") {
    // Check if there's a base tag (most reliable)
    const baseTag = document.querySelector("base");
    if (baseTag?.href) {
      try {
        const baseUrl = new URL(baseTag.href, window.location.origin);
        const pathname = baseUrl.pathname;
        if (pathname && pathname !== "/") {
          return pathname.replace(/\/$/, "");
        }
      } catch {
        // Invalid URL, ignore
      }
    }
  }

  // Default to root (standard client-side routing)
  return "/";
}

export const routes = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={page(Home)} handle={{ pageType: "home" }} />
      <Route
        path="/products"
        element={page(ProductListing)}
        handle={{ pageType: "product-listing" }}
      />
      <Route
        path="/product/:slug"
        element={page(ProductDescription)}
        handle={{ pageType: "product-description" }}
      />
      <Route
        path="/brands"
        element={page(Brands)}
        handle={{ pageType: "brands" }}
      />
      <Route
        path="/brands/:department"
        element={page(Brands)}
        handle={{ pageType: "brands" }}
      />
      <Route
        path="/brand/:slug"
        element={page(Brands)}
        handle={{ pageType: "brand-listing" }}
      />
      <Route
        path="/categories"
        element={page(Categories)}
        handle={{ pageType: "categories" }}
      />
      <Route
        path="/categories/:department"
        element={page(Categories)}
        handle={{ pageType: "categories" }}
      />
      <Route
        path="/category/:slug"
        element={page(Categories)}
        handle={{ pageType: "categories-listing" }}
      />
      <Route
        path="/collections"
        element={page(Collections)}
        handle={{ pageType: "collections" }}
      />
      <Route
        path="/collection/:slug"
        element={page(CollectionListing)}
        handle={{ pageType: "collection-listing" }}
      />
      <Route path="/compare" element={page(Compare)} />
      <Route
        path="/wishlist"
        element={page(Wishlist)}
        handle={{ pageType: "wishlist", csrOnly: true }}
      />
      <Route
        path="/cart"
        element={page(CartLanding)}
        handle={{ pageType: "cart-landing", csrOnly: true }}
      />
      <Route
        path="/cart/bag"
        element={page(CartLanding)}
        handle={{ pageType: "cart-landing", csrOnly: true }}
      />
      <Route
        path="/cart/checkout"
        element={page(SinglePageCheckout)}
        handle={{ pageType: "single-page-checkout", csrOnly: true }}
      />
      <Route
        path="/cart/order-status"
        element={page(OrderStatus)}
        handle={{ pageType: "order-status", csrOnly: true }}
      />
      <Route
        path="/shared-cart/:token"
        element={page(SharedCart)}
        handle={{ pageType: "shared-cart", csrOnly: true }}
      />
      <Route
        path="/order-tracking"
        element={page(OrderTracking)}
        handle={{ pageType: "order-tracking", csrOnly: true }}
      />
      <Route
        path="/order-tracking/:orderId"
        element={page(OrderTrackingDetails)}
        handle={{ pageType: "order-tracking-details", csrOnly: true }}
      />
      <Route
        path="/order-tracking/:orderId/:shipmentId"
        element={page(OrderTrackingDetails)}
        handle={{ pageType: "order-tracking-details", csrOnly: true }}
      />
      <Route
        path="/orders"
        element={page(OrdersList)}
        handle={{ pageType: "orders-list", csrOnly: true }}
      />
      <Route
        path="/auth/login"
        element={page(Login)}
        handle={{ pageType: "auth-login", csrOnly: true }}
      />
      <Route
        path="/auth/register"
        element={page(Register)}
        handle={{ pageType: "auth-register", csrOnly: true }}
      />
      <Route
        path="/auth/forgot-password"
        element={page(ForgotPassword)}
        handle={{ pageType: "forgot-password", csrOnly: true }}
      />
      <Route
        path="/auth/set-password"
        element={page(SetPassword)}
        handle={{ pageType: "auth-set-password", csrOnly: true }}
      />
      <Route
        path="/auth/account-locked"
        element={page(AccountLocked)}
        handle={{ pageType: "account-locked", csrOnly: true }}
      />
      <Route
        path="/auth/edit-profile"
        element={page(EditProfile)}
        handle={{ pageType: "edit-profile", csrOnly: true }}
      />
      <Route
        path="/auth/verify-email"
        element={page(VerifyEmail)}
        handle={{ pageType: "verify-email", csrOnly: true }}
      />
      <Route
        path="/auth/verify-email-link"
        element={page(VerifyEmailLink)}
        handle={{ pageType: "verify-email-link", csrOnly: true }}
      />
      <Route
        path="/profile"
        element={page(Profile)}
        handle={{ pageType: "profile", csrOnly: true }}
      />
      <Route
        path="/profile/profile-tabs"
        element={page(Profile)}
        handle={{ pageType: "profile", csrOnly: true }}
      />
      <Route
        path="/profile/details"
        element={page(ProfileDetails)}
        handle={{ pageType: "profile-details", csrOnly: true }}
      />
      <Route
        path="/profile/phone"
        element={page(ProfilePhone)}
        handle={{ pageType: "profile-phone", csrOnly: true }}
      />
      <Route
        path="/profile/email"
        element={page(ProfileEmail)}
        handle={{ pageType: "profile-email", csrOnly: true }}
      />
      <Route
        path="/profile/orders"
        element={page(OrdersList)}
        handle={{ pageType: "orders-list", csrOnly: true }}
      />
      <Route
        path="/profile/orders/shipment/:shipmentId"
        element={page(ShipmentDetails)}
        handle={{ pageType: "shipment-details", csrOnly: true }}
      />
      <Route
        path="/profile/orders/shipment/update/:shipmentId/:type"
        element={page(ShipmentUpdate)}
        handle={{ pageType: "shipment-update", csrOnly: true }}
      />
      <Route
        path="/profile/address"
        element={page(ProfileAddress)}
        handle={{ pageType: "profile-address", csrOnly: true }}
      />
      <Route
        path="/profile/refer-earn"
        element={page(Profile)}
        handle={{ pageType: "profile", csrOnly: true }}
      />
      <Route
        path="/profile/my-cards"
        element={page(Profile)}
        handle={{ pageType: "profile", csrOnly: true }}
      />
      <Route
        path="/profile/refer-earn-credit"
        element={page(Profile)}
        handle={{ pageType: "profile", csrOnly: true }}
      />
      <Route
        path="/page/:slug"
        element={page(MarketingPage)}
        handle={{ pageType: "page" }}
      />
      <Route
        path="/c/*"
        element={page(MarketingPage)}
        handle={{ pageType: "page" }}
      />
      <Route path="/blog" element={page(Blog)} handle={{ pageType: "blog" }} />
      <Route
        path="/blog/:slug"
        element={page(BlogDetail)}
        handle={{ pageType: "blog" }}
      />
      <Route
        path="/sections/:slug"
        element={page(SectionsPage)}
        handle={{ pageType: "section-page" }}
      />
      <Route
        path="/form/:slug"
        element={page(FormItem)}
        handle={{ pageType: "form-item" }}
      />
      <Route
        path="/faq"
        element={page(Faq)}
        handle={{ pageType: "faq", csrOnly: true }}
      />
      <Route
        path="/faq/:slug"
        element={page(Faq)}
        handle={{ pageType: "faq", csrOnly: true }}
      />
      <Route
        path="/contact-us"
        element={page(ContactUs)}
        handle={{ pageType: "contact-us" }}
      />
      <Route
        path="/about-us"
        element={page(AboutUs)}
        handle={{ pageType: "about-us" }}
      />
      <Route
        path="/locate-us"
        element={page(LocateUs)}
        handle={{ pageType: "locate-us" }}
      />
      <Route
        path="/privacy-policy"
        element={page(PrivacyPolicy)}
        handle={{ pageType: "policy" }}
      />
      <Route
        path="/shipping-policy"
        element={page(ShippingPolicy)}
        handle={{ pageType: "shipping-policy" }}
      />
      <Route
        path="/return-policy"
        element={page(ReturnPolicy)}
        handle={{ pageType: "return-policy" }}
      />
      <Route
        path="/terms-and-conditions"
        element={page(TermsAndConditions)}
        handle={{ pageType: "tnc" }}
      />
      <Route path="/payment/link/:id" element={page(PaymentLink)} />
      <Route
        path="/refund/order/:orderId/shipment/:shipmentId"
        element={page(RefundOrder)}
      />
      <Route
        path="/return/order/:orderId/shipment/:shipmentId"
        element={page(ReturnSummaryStatus)}
      />
      <Route
        path="/reattempt/shipment/:shipmentId"
        element={page(RequestReattempt)}
      />
      {/* Single-segment URLs (e.g. /product-slug-123) from PLP/collection open PDP when not a reserved path */}
      <Route
        path=":slug"
        element={page(ProductBySlugGate)}
        handle={{ pageType: "product-description" }}
      />
      <Route
        path="*"
        element={page(NotFoundPage)}
        handle={{ pageType: "not-found-page" }}
      />
    </Route>,
  ),
  {
    basename: getBasename(),
  },
);
