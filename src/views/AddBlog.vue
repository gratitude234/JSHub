<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-20 text-[#2C3E50]">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white shadow">
      <div class="py-4 px-4 flex justify-between items-center">
        <button @click="goBack" class="text-white font-bold">← Back</button>
        <h1 class="text-lg font-bold text-center flex-1 -ml-6">
          📝 {{ isEditing ? 'Edit Blog Post' : 'New Blog Post' }}
        </h1>
        <div class="w-6"></div>
      </div>
    </header>

    <!-- Form -->
    <section class="p-4 space-y-5">
      <!-- Blog Title -->
      <input
        v-model="title"
        type="text"
        placeholder="Enter blog title..."
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
      />

      <!-- Post Type Dropdown -->
      <select
        v-model="postType"
        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
      >
        <option value="blog">📝 Regular Blog Post</option>
        <option value="su_campaign">🗳️ SU Campaign Post</option>
      </select>

      <!-- Cover Image Upload -->
      <div>
        <label class="block text-sm font-semibold mb-1">Cover Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-[#003f7f] file:text-white
                 hover:file:bg-[#002a5c]"
        />
        <p v-if="existingCoverUrl" class="text-xs mt-2 text-gray-500">Current cover: {{ existingCoverUrl }}</p>
      </div>

      <!-- Editor -->
      <EditorContent
        v-if="editor"
        :editor="editor"
        class="bg-white border border-gray-300 rounded-xl p-4 min-h-[250px]"
      />

      <!-- Toolbar -->
      <div class="flex flex-wrap gap-2 mt-2 text-sm">
        <button @click="toggle('bold')" :class="toolbarBtn('bold')">Bold</button>
        <button @click="toggle('italic')" :class="toolbarBtn('italic')">Italic</button>
        <button @click="toggleHeading(2)" :class="toolbarBtn('heading', { level: 2 })">H2</button>
        <button @click="toggle('bulletList')" :class="toolbarBtn('bulletList')">• List</button>
        <button @click="toggle('blockquote')" :class="toolbarBtn('blockquote')">❝ Quote</button>
      </div>

      <!-- Preview Button -->
      <button
        @click="togglePreview"
        class="w-full border border-[#003f7f] text-[#003f7f] font-semibold py-2 rounded-xl hover:bg-[#e9f3ff] transition"
      >
        👁️ Preview Blog
      </button>

      <!-- Publish -->
      <button
        @click="submitPost"
        :disabled="loading"
        class="w-full bg-[#7f4000] hover:bg-[#5f3000] text-white font-semibold py-3 rounded-xl shadow transition"
      >
        {{ loading ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update Blog' : 'Publish Blog') }}
      </button>

      <!-- Feedback -->
      <p v-if="message" class="text-[#28a745] text-center text-sm">{{ message }}</p>
      <p v-if="error" class="text-red-600 text-center text-sm">{{ error }}</p>
    </section>

    <!-- Blog Preview Modal -->
<div
  v-if="showPreview"
  class="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center"
>
  <div class="bg-white rounded-xl w-[90%] max-w-2xl p-6 shadow-lg overflow-y-auto max-h-[90vh]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold text-[#003f7f]">📰 Blog Preview</h2>
      <button @click="showPreview = false" class="text-red-600 font-bold text-xl">×</button>
    </div>
    <h3 class="text-xl font-bold mb-2">{{ title }}</h3>
    <div class="text-sm text-gray-500 mb-3">{{ postTypeLabel }}</div>
    <div v-html="editor?.getHTML()" class="prose max-w-none"></div>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted, watchEffect, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const blogId = ref(route.query.id || null)
const isEditing = ref(!!blogId.value)

const title = ref('')
const postType = ref('blog')
const coverImage = ref(null)
const existingCoverUrl = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)
const showPreview = ref(false)

const editor = useEditor({
  extensions: [StarterKit],
  content: '',
})

const postTypeLabel = computed(() =>
  postType.value === 'su_campaign' ? '🗳️ SU Campaign Post' : '📝 Regular Blog Post'
)

function goBack() {
  router.back()
}

function toolbarBtn(format, opts = {}) {
  const isActive = editor.value?.isActive(format, opts)
  return `px-3 py-1 rounded transition ${isActive ? 'bg-[#003f7f] text-white' : 'bg-gray-100'}`
}

function toggle(format) {
  editor.value?.chain().focus()[`toggle${capitalize(format)}`]().run()
}

function toggleHeading(level) {
  editor.value?.chain().focus().toggleHeading({ level }).run()
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    coverImage.value = file
  } else {
    alert('Please select a valid image file.')
  }
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

async function submitPost() {
  message.value = ''
  error.value = ''
  loading.value = true

  const user_id = userStore.user?.id
  if (!user_id) {
    error.value = '⚠️ You must be logged in to post.'
    loading.value = false
    return
  }

  const content = editor.value?.getHTML() || ''
  const excerpt = editor.value?.getText().slice(0, 100) + '...'

  try {
    const formData = new FormData()
    formData.append('user_id', user_id)
    formData.append('title', title.value)
    formData.append('content', content)
    formData.append('excerpt', excerpt)
    formData.append('post_type', postType.value)
    if (coverImage.value) formData.append('cover_image', coverImage.value)
    if (isEditing.value) formData.append('id', blogId.value)

    const endpoint = isEditing.value
      ? 'https://jabumarket.com.ng/api/update_blog_post.php'
      : 'https://jabumarket.com.ng/api/add_blog_post.php'

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData
    })

    const data = await res.json()

    if (res.ok && data.success) {
      clearDraft()
      message.value = isEditing.value ? '✅ Blog updated successfully!' : '✅ Blog posted successfully!'
      setTimeout(() => router.push('/my-blogs'), 1500)
    } else {
      error.value = data.error || 'Something went wrong'
    }
  } catch (err) {
    error.value = 'Network error. Please try again.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function loadExistingBlog() {
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/get_blog.php?id=${blogId.value}`)
    const data = await res.json()
    if (data.success && data.blog) {
      title.value = data.blog.title
      postType.value = data.blog.post_type || 'blog'
      existingCoverUrl.value = data.blog.cover_url || ''
      editor.value?.commands.setContent(data.blog.content || '')
    }
  } catch (err) {
    error.value = '❌ Failed to load blog content.'
    console.error(err)
  }
}

function waitForEditor() {
  return new Promise(resolve => {
    const check = () => {
      if (editor.value) {
        resolve()
      } else {
        setTimeout(check, 50)
      }
    }
    check()
  })
}

function clearDraft() {
  localStorage.removeItem('draft_blog')
}

watchEffect(() => {
  if (!isEditing.value && editor.value) {
    const draft = {
      title: title.value,
      postType: postType.value,
      content: editor.value?.getHTML() || ''
    }
    localStorage.setItem('draft_blog', JSON.stringify(draft))
  }
})

onMounted(async () => {
  await waitForEditor()
  if (isEditing.value) {
    await loadExistingBlog()
  } else {
    const saved = localStorage.getItem('draft_blog')
    if (saved) {
      const parsed = JSON.parse(saved)
      title.value = parsed.title || ''
      postType.value = parsed.postType || 'blog'
      editor.value?.commands.setContent(parsed.content || '')
    }
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.prose {
  max-width: 100%;
}
</style>
