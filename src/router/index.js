// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Layout
import MainLayout from '../layouts/MainLayout.vue'

// Core Views
import Home from '../views/Home.vue'
import Marketplace from '../views/Marketplace.vue'
import Product from '../views/Product.vue'
import Payment from '../views/Payment.vue'
import MessageSeller from '../views/MessageSeller.vue'
import ApplyForm from '../views/ApplyForm.vue'
import AdminDashboard from '../admin/AdminDashboard.vue'

// Auth
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import CompleteProfile from '../views/CompleteProfile.vue'
import Profile from '../views/Profile.vue'
import VerifyOtp from '../views/VerifyOtp.vue'

// Blog
import Blog from '../views/Blog.vue'
import BlogPost from '../views/BlogPost.vue'
import AddBlog from '../views/AddBlog.vue'
import UploadBlog from '../views/UploadBlog.vue'
import MyBlogs from '../views/MyBlogs.vue'

// Quiz System
import Quiz from '../views/Quiz.vue'
import DailyQuiz from '../views/DailyQuiz.vue'
import PracticeMode from '../views/PracticeMode.vue'
import ExamMode from '../views/ExamMode.vue'
import ExamSummary from '../views/ExamSummary.vue'
import Leaderboard from '../views/Leaderboard.vue'
import ExamLeaderboard from '../views/ExamLeaderboard.vue'
import Progress from '../views/Progress.vue'
import MyProgress from '../views/MyProgress.vue'
import TheoryDrill from '../views/TheoryDrill.vue'
import TheoryProgress from '../views/TheoryProgress.vue'
import TheoryLeaderboard from '../views/TheoryLeaderboard.vue'


// Community
import Upload from '../views/Upload.vue'
import Community from '../views/Community.vue'
import LostFound from '../views/LostFound.vue'
import Notification from '../views/Notification.vue'
import UploadVibe from '../views/UploadVibe.vue'
import Anonymous from '../views/Anonymous.vue'
import MyVibes from '../views/MyVibes.vue'

// Other
import ComingSoon from '../views/ComingSoon.vue'
import Wishlist from '../views/Wishlist.vue'
import MyUploads from '../views/MyUploads.vue'
import Sell from '../views/Sell.vue'
import JoinTeam from '../views/JoinTeam.vue'
import Orders from '../views/Orders.vue'

// Study Tools
import StudyHub from '../views/StudyHub.vue'
import Materials from '../views/Materials.vue'
import UploadMaterial from '../views/UploadMaterial.vue'
import MyMaterials from '../views/MyMaterials.vue'
import PastQuestions from '../views/PastQuestions.vue'
import UploadPastQuestion from '../views/UploadPastQuestion.vue'
import MyTheoryAnswers from '../views/MyTheoryAnswers.vue'
import AIAssistant from '../views/AIAssistant.vue'

// Products
import MyProducts from '../views/MyProducts.vue'

// Admin
import ApproveMaterials from '../views/ApproveMaterials.vue'
import Transactions from '../admin/Transactions.vue'
import AiUsage from '../views/AiUsage.vue' 


// Announcements
import Announcements from '../views/Announcements.vue'
import UploadAnnouncement from '../views/UploadAnnouncement.vue'

// Feedback
import Feedback from '../views/Feedback.vue'

// Did You Know
import DidYouKnow from '../views/DidYouKnow.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'Home', component: Home },
      { path: 'marketplace', name: 'Marketplace', component: Marketplace },
      { path: 'product/:id', name: 'Product', component: Product, props: true },
      { path: 'payment/:id', name: 'Payment', component: Payment, props: true },
      { path: 'message/:receiverId', name: 'MessageSeller', component: MessageSeller, props: true },
      { path: 'join-team', name: 'JoinTeam', component: JoinTeam },
      { path: 'apply', name: 'ApplyForm', component: ApplyForm },
      { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },

      // Announcements
      { path: 'announcements', name: 'Announcements', component: Announcements },
      { path: 'upload-announcement', name: 'UploadAnnouncement', component: UploadAnnouncement },

      // Blog
      { path: 'blog', name: 'Blog', component: Blog },
      { path: 'blog/:id', name: 'BlogPost', component: BlogPost, props: true },
      { path: 'add-blog', name: 'AddBlog', component: AddBlog },
      { path: 'upload-blog', name: 'UploadBlog', component: UploadBlog },
      { path: 'my-blogs', name: 'MyBlogs', component: MyBlogs },

      // Quiz System
      { path: 'quiz', name: 'Quiz', component: Quiz },
      { path: 'daily-quiz', name: 'DailyQuiz', component: DailyQuiz },
      { path: 'practice-mode', name: 'PracticeMode', component: PracticeMode },
      { path: 'exam-mode', name: 'ExamMode', component: ExamMode },
      { path: 'exam-summary', name: 'ExamSummary', component: ExamSummary },
      { path: 'leaderboard', name: 'Leaderboard', component: Leaderboard },
      { path: 'exam-leaderboard', name: 'ExamLeaderboard', component: ExamLeaderboard },
      { path: 'progress', name: 'Progress', component: Progress },
      { path: 'my-progress', name: 'MyProgress', component: MyProgress },
      { path: 'theory-drill', name: 'TheoryDrill', component: TheoryDrill },
      { path: 'theory-progress', name: 'TheoryProgress', component: TheoryProgress },
      { path: 'theory-leaderboard', name: 'TheoryLeaderboard', component: TheoryLeaderboard },

      // Community
      { path: 'upload', name: 'Upload', component: Upload },
      { path: 'community', name: 'Community', component: Community },
      { path: 'lost-found', name: 'LostFound', component: LostFound },
      { path: 'notifications', name: 'Notification', component: Notification },
      { path: 'upload-vibe', name: 'UploadVibe', component: UploadVibe },
      { path: 'anonymous', name: 'Anonymous', component: Anonymous },
      { path: 'my-vibes', name: 'MyVibes', component: MyVibes },

      // Other
      { path: 'coming-soon', name: 'ComingSoon', component: ComingSoon },
      { path: 'wishlist', name: 'Wishlist', component: Wishlist },
      { path: 'my-uploads', name: 'MyUploads', component: MyUploads },
      { path: 'my-materials', name: 'MyMaterials', component: MyMaterials },
      { path: 'my-products', name: 'MyProducts', component: MyProducts },
      { path: 'sell', name: 'Sell', component: Sell },
      { path: 'feedback', name: 'Feedback', component: Feedback },
      { path: 'orders', name: 'Orders', component: Orders },

      // Study Tools
      { path: 'study-hub', name: 'StudyHub', component: StudyHub },
      { path: 'materials', name: 'Materials', component: Materials },
      { path: 'upload-material', name: 'UploadMaterial', component: UploadMaterial },
      { path: 'past-questions', name: 'PastQuestions', component: PastQuestions },
      { path: 'upload-past-question', name: 'UploadPastQuestion', component: UploadPastQuestion },
      { path: 'my-theory-answers', name: 'MyTheoryAnswers', component: MyTheoryAnswers },
      { path: 'ai-assistant', name: 'AIAssistant', component: AIAssistant },
      { path: 'ai-usage', name: 'AiUsage', component: AiUsage },


      // Did You Know
      { path: 'did-you-know', name: 'DidYouKnow', component: DidYouKnow },

      // Profile
      { path: 'profile', name: 'Profile', component: Profile }
    ]
  },

  // Outside layout
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/verify-otp', name: 'VerifyOtp', component: VerifyOtp },
  { path: '/complete-profile', name: 'CompleteProfile', component: CompleteProfile },

  // Admin
  { path: '/admin/approve-materials', name: 'ApproveMaterials', component: ApproveMaterials },
  { path: '/admin/transactions', name: 'Transactions', component: Transactions }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const user = userStore.user

  const publicPages = [
    'Home', 'Marketplace', 'Product', 'Blog', 'BlogPost',
    'Login', 'Register', 'VerifyOtp',
    'Announcements', 'Feedback', 'DidYouKnow',
    'Quiz', 'DailyQuiz', 'PracticeMode', 'ExamMode',
    'ExamSummary', 'Leaderboard', 'ExamLeaderboard',
    'Progress', 'MyProgress', 'TheoryDrill', 'TheoryProgress', 'TheoryLeaderboard',
    'Materials', 'PastQuestions', 'UploadPastQuestion', 'MyTheoryAnswers',
    'AIAssistant'
  ]

  const adminOnly = ['ApproveMaterials', 'UploadAnnouncement', 'Transactions']
  if (adminOnly.includes(to.name) && (!user || user.role !== 'admin')) return next('/login')

  const authRequired = !publicPages.includes(to.name)
  if (authRequired && !user) return next('/login')

  next()
})

export default router
