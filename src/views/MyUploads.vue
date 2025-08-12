<!-- src/views/MyUploads.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Header -->
    <header
      class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md"
    >
      📁 My Uploads
    </header>

    <div class="p-4 space-y-12">
      <!-- Loader -->
      <div
        v-if="loading"
        class="text-center py-20 animate-pulse text-sm text-gray-500"
      >
        ⏳ Fetching your uploads…
      </div>

      <!-- Upload sections -->
      <section
        v-for="section in sections"
        :key="section.type"
        v-if="!loading"
        class="space-y-4"
      >
        <!-- Section header -->
        <div class="flex justify-between items-center">
          <h2
            class="text-lg font-bold text-[#003f7f] flex items-center gap-2"
          >
            <span class="text-xl">{{ section.icon }}</span>
            {{ section.title }}
            <span
              class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full"
              >{{ section.items.length }}</span
            >
          </h2>

          <button
            v-if="section.uploadRoute"
            @click="router.push(section.uploadRoute)"
            class="text-sm font-semibold text-[#003f7f] bg-white border border-[#003f7f] px-3 py-1 rounded-md hover:bg-[#e6f2ff] transition"
          >
            ➕ Upload
          </button>
        </div>

        <!-- Items -->
        <div v-if="section.items.length" class="space-y-3">
          <div
            v-for="item in section.items"
            :key="item.id"
            class="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition duration-300 border border-gray-100"
          >
            <!-- Study material card -->
            <template v-if="section.type === 'material'">
              <div class="flex items-start gap-3">
                <div
                  class="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center text-[#003f7f] text-lg"
                >
                  📄
                </div>
                <div class="flex-1 space-y-0.5">
                  <p class="font-bold text-sm">{{ item.title }}</p>
                  <p class="text-xs text-gray-500">
                    {{ item.course_code }} • {{ item.level }}L
                  </p>
                  <p class="text-xs text-gray-400">
                    📥 {{ item.download_count }} downloads •
                    {{ timeAgo(item.created_at) }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Product card -->
            <template v-else-if="section.type === 'product'">
              <div class="flex gap-3">
                <img
                  v-if="item.image"
                  :src="`https://jabumarket.com.ng/${item.image}`"
                  alt="Product image"
                  class="w-16 h-16 rounded-lg object-cover border bg-gray-100"
                />
                <div class="flex-1 space-y-0.5">
                  <p class="font-bold text-sm text-[#003f7f]">
                    {{ item.title }}
                  </p>
                  <p class="text-xs text-gray-500">
                    ₦{{ Number(item.price).toLocaleString() }}
                  </p>
                  <p
                    class="text-xs font-medium"
                    :class="{
                      'text-green-600': item.status === 'Available',
                      'text-yellow-500': item.status === 'Pending Payment',
                      'text-gray-500': item.status === 'Sold'
                    }"
                  >
                    🏷️ {{ item.status }}
                  </p>
                  <p class="text-xs text-gray-400">
                    🗓️ {{ timeAgo(item.created_at) }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Blog card -->
            <template v-else-if="section.type === 'blog'">
              <div>
                <p class="font-bold text-sm text-[#003f7f]">
                  {{ item.title }}
                </p>
                <p class="text-xs text-gray-600 mt-1">
                  {{
                    item.body?.slice(0, 80) +
                    (item.body?.length > 80 ? '…' : '')
                  }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  🗓️ {{ timeAgo(item.created_at) }}
                </p>
              </div>
            </template>

            <!-- Campus vibe card -->
            <template v-else-if="section.type === 'post'">
              <div>
                <p class="text-sm font-semibold text-[#2C3E50]">
                  {{
                    item.body?.slice(0, 50) +
                    (item.body?.length > 50 ? '…' : '')
                  }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  💬 Posted {{ timeAgo(item.created_at) }}
                </p>
              </div>
            </template>

            <!-- Item actions -->
            <div class="mt-3 flex justify-end gap-3 text-sm">
              <button
                @click="section.startEdit(item)"
                class="text-[#28a745] font-medium hover:underline"
              >
                ✏️ Edit
              </button>
              <button
                @click="deleteItem(section.type, item.id)"
                class="text-red-500 font-medium hover:underline"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="bg-white rounded-xl shadow text-center text-sm text-gray-400 py-10 italic"
        >
          🚫 No {{ section.title.toLowerCase() }} yet.
        </div>
      </section>
    </div>

    <!-- Edit modals -->
    <EditModal
      v-if="editingMaterial"
      title="✏️ Edit Material"
      :form="editMaterialForm"
      @cancel="editingMaterial = null"
      @save="updateMaterial"
    >
      <input v-model="editMaterialForm.title" placeholder="Title" class="input" />
      <input v-model="editMaterialForm.course_code" placeholder="Course Code" class="input" />
      <input v-model="editMaterialForm.level" placeholder="Level (e.g., 100)" class="input" />
    </EditModal>

    <EditModal
      v-if="editingProduct"
      title="✏️ Edit Product"
      :form="editProductForm"
      @cancel="editingProduct = null"
      @save="updateProduct"
    >
      <input v-model="editProductForm.title" placeholder="Title" class="input" />
      <input
        v-model="editProductForm.price"
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        class="input"
      />
    </EditModal>

    <EditModal
      v-if="editingBlog"
      title="✏️ Edit Blog Post"
      :form="editBlogForm"
      @cancel="editingBlog = null"
      @save="updateBlog"
    >
      <input v-model="editBlogForm.title" placeholder="Title" class="input" />
      <textarea v-model="editBlogForm.body" rows="5" placeholder="Body…" class="input" />
    </EditModal>

    <EditModal
      v-if="editingPost"
      title="✏️ Edit Post"
      :form="editPostForm"
      @cancel="editingPost = null"
      @save="updatePost"
    >
      <input v-model="editPostForm.title" placeholder="Title (optional)" class="input" />
      <textarea v-model="editPostForm.body" rows="5" placeholder="Post body…" class="input" />
    </EditModal>
  </div>
</template>

<script setup>
/* ------------------------------------------------------------------ */
/* Imports                                                             */
/* ------------------------------------------------------------------ */
import { ref, computed, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import EditModal from '../components/EditModal.vue'

/* ------------------------------------------------------------------ */
/* Pinia ‑ make sure store is hydrated                                 */
/* ------------------------------------------------------------------ */
const userStore = useUserStore()
if (!userStore.user) {
  const cached = localStorage.getItem('user')
  if (cached) userStore.setUser(JSON.parse(cached))
}
const userId = computed(() => userStore.user?.id)

/* ------------------------------------------------------------------ */
/* Reactive data                                                       */
/* ------------------------------------------------------------------ */
const router = useRouter()
const loading = ref(true)

const materials = ref([])
const products  = ref([])
const blogs     = ref([])
const posts     = ref([])

/* Edit‑modal refs */
const editingMaterial = ref(null)
const editingProduct  = ref(null)
const editingBlog     = ref(null)
const editingPost     = ref(null)

const editMaterialForm = ref({})
const editProductForm  = ref({})
const editBlogForm     = ref({})
const editPostForm     = ref({})

/* Time‑ago helper */
const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 86_400_000)
  return isNaN(diff) ? 'some time ago' : diff === 0 ? 'today' : `${diff} day${diff > 1 ? 's' : ''} ago`
}

/* Section meta (reactive via .value replacement) */
const sections = ref([
  { type: 'material', title: 'Study Materials', icon: '📚', items: materials.value, uploadRoute: '/upload-material',
    startEdit: (m)=>{editingMaterial.value=m; editMaterialForm.value={...m}} },
  { type: 'product',  title: 'Marketplace Products', icon: '🛒', items: products.value,  uploadRoute: '/sell',
    startEdit: (p)=>{editingProduct.value=p;  editProductForm.value={...p}} },
  { type: 'blog',     title: 'Blog Posts',          icon: '📝', items: blogs.value,     uploadRoute: '/upload-blog',
    startEdit: (b)=>{editingBlog.value=b;     editBlogForm.value={...b}} },
  { type: 'post',     title: 'Campus Vibes',        icon: '💬', items: posts.value,     uploadRoute: '/upload-vibe',
    startEdit: (p)=>{editingPost.value=p;     editPostForm.value={...p}} }
])

/* ------------------------------------------------------------------ */
/* Fetcher                                                             */
/* ------------------------------------------------------------------ */
const fetchAllData = async () => {
  try {
    loading.value = true
    const [matRes, prodRes, blogRes, postRes] = await Promise.all([
      fetch(`https://jabumarket.com.ng/api/get_my_materials.php?user_id=${userId.value}`),
      fetch(`https://jabumarket.com.ng/api/get_my_products.php?user_id=${userId.value}`),
      fetch(`https://jabumarket.com.ng/api/get_my_blogs.php?user_id=${userId.value}`),
      fetch(`https://jabumarket.com.ng/api/get_my_posts.php?user_id=${userId.value}`)
    ])
    materials.value = await matRes.json()
    products.value  = await prodRes.json()
    blogs.value     = await blogRes.json()
    posts.value     = await postRes.json()

    /* refresh section arrays so Vue tracks reactivity */
    sections.value[0].items = materials.value
    sections.value[1].items = products.value
    sections.value[2].items = blogs.value
    sections.value[3].items = posts.value
  } catch (e) {
    console.error('Failed to load uploads:', e)
  } finally {
    loading.value = false
  }
}

/* ------------------------------------------------------------------ */
/* Spinner‑lock fix – watch userId                                     */
/* ------------------------------------------------------------------ */
watch(
  userId,
  (val) => {
    if (val) {
      fetchAllData()            // user ready → fetch
    } else {
      // still no user after 1 s → show empty state instead of spinner
      setTimeout(() => (loading.value = false), 1000)
    }
  },
  { immediate: true }
)

/* ------------------------------------------------------------------ */
/* Helpers: delete / update (unchanged in logic)                       */
/* ------------------------------------------------------------------ */
const deleteItem = async (type, id) => {
  if (!confirm('Delete this item?')) return
  const res = await fetch(`https://jabumarket.com.ng/api/delete_${type}.php?id=${id}`, { method: 'DELETE' })
  const ok  = await res.json()
  if (!ok.success) return alert('Delete failed')
  if (type==='material') materials.value = materials.value.filter(m=>m.id!==id)
  if (type==='product')  products.value  = products.value.filter(p=>p.id!==id)
  if (type==='blog')     blogs.value     = blogs.value.filter(b=>b.id!==id)
  if (type==='post')     posts.value     = posts.value.filter(p=>p.id!==id)
}

const updateMaterial = async () => { await saveUpdate('material', editMaterialForm, editingMaterial) }
const updateProduct  = async () => { await saveUpdate('product',  editProductForm,  editingProduct) }
const updateBlog     = async () => { await saveUpdate('blog',     editBlogForm,     editingBlog) }
const updatePost     = async () => { await saveUpdate('post',     editPostForm,     editingPost) }

async function saveUpdate(type, formRef, editingRef) {
  const res = await fetch(`https://jabumarket.com.ng/api/update_${type}.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formRef.value)
  })
  const ok = await res.json()
  if (!ok.success) return alert('Update failed')
  Object.assign(editingRef.value, formRef.value)
  editingRef.value = null
}

/* refetch on keep‑alive activation */
onActivated(() => userId.value && fetchAllData())
</script>

<style scoped>
.input {
  @apply w-full p-2 border rounded mt-2;
}
</style>
