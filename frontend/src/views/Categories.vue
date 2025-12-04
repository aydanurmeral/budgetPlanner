<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold text-gray-900">Kategoriler</h2>
        <p class="mt-2 text-gray-600">Gelir ve gider kategorilerinizi yönetin</p>
      </div>
      <button
        @click="showModal = true"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
      >
        + Yeni Kategori
      </button>
    </div>

   
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="category in categories"
        :key="category.id"
        class="bg-white shadow rounded-lg p-4 border-l-4"
        :style="{ borderLeftColor: category.color }"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: category.color }"></div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ category.type === 'income' ? 'Gelir' : 'Gider' }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="editCategory(category)"
              class="text-indigo-600 hover:text-indigo-900 text-sm"
            >
              Düzenle
            </button>
            <button
              @click="deleteCategory(category.id)"
              class="text-red-600 hover:text-red-900 text-sm"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

 
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle' }}
          </h3>
          <form @submit.prevent="saveCategory" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Kategori Adı</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Tip</label>
              <select v-model="form.type" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Renk</label>
              <div class="mt-1 flex gap-2">
                <input
                  v-model="form.color"
                  type="color"
                  class="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  v-model="form.color"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div class="flex gap-2">
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Kaydet
              </button>
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoriesAPI } from '../services/api'

const categories = ref([])
const showModal = ref(false)
const editingCategory = ref(null)

const form = ref({
  name: '',
  type: 'expense',
  color: '#3B82F6'
})

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Kategoriler yüklenirken hata:', error)
  }
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await categoriesAPI.update(editingCategory.value.id, form.value)
    } else {
      await categoriesAPI.create(form.value)
    }
    await loadCategories()
    closeModal()
    window.dispatchEvent(new CustomEvent('data-updated'))
  } catch (error) {
    console.error('Kategori kaydedilirken hata:', error)
    alert('Kategori kaydedilemedi. Lütfen tekrar deneyin.')
  }
}

const editCategory = (category) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    type: category.type,
    color: category.color
  }
  showModal.value = true
}

const deleteCategory = async (id) => {
  if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz? Bu kategoriye ait tüm işlemler de silinecektir.')) return
  
  try {
    await categoriesAPI.delete(id)
    await loadCategories()
    window.dispatchEvent(new CustomEvent('data-updated'))
  } catch (error) {
    console.error('Kategori silinirken hata:', error)
    alert('Kategori silinemedi. Lütfen tekrar deneyin.')
  }
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  form.value = {
    name: '',
    type: 'expense',
    color: '#3B82F6'
  }
}

onMounted(() => {
  loadCategories()
})
</script>


