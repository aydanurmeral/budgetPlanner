<template>
  <div class="min-h-screen" :class="isDark ? 'bg-gray-900' : 'bg-gray-50'">
    <nav class="bg-white shadow-sm border-b" :class="isDark ? 'bg-gray-800 border-gray-700' : ''">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold" :class="isDark ? 'text-indigo-400' : 'text-indigo-600'"> Finans Takip</h1>
            </div>
            <div v-if="isAuthenticated" class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/"
                class="border-transparent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition"
                :class="isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-00 hover:text-gray-700'"
                active-class="border-indigo-500 text-gray-900"
              >
                Dashboard
              </router-link>
              <router-link
                to="/transactions"
                class="border-transparent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition"
                :class="isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'"
                active-class="border-indigo-500 text-gray-900"
              >
                İşlemler
              </router-link>
              <router-link
                to="/categories"
                class="border-transparent inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition"
                :class="isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'"
                active-class="border-indigo-500 text-gray-900"
              >
                Kategoriler
              </router-link>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg hover:bg-gray-100 transition"
              :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'"
            >
              {{ isDark ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <div class="flex items-center gap-2">
              <span v-if="isAuthenticated" class="text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ user?.name }}</span>
              <button
                v-if="isAuthenticated"
                @click="handleLogout"
                class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 transition"
                :class="isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600'"
              >
                Çıkış
              </button>
              <router-link
                v-else
                to="/login"
                class="px-3 py-1 text-sm rounded-lg hover:bg-gray-100 transition"
                :class="isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600'"
              >
                Giriş
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isDark = ref(localStorage.getItem('darkMode') === 'true')
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const isAuthenticated = computed(() => {
  const token = localStorage.getItem('token')
  return !!token && !!user.value
})

watch(() => route.path, () => {
  const storedUser = localStorage.getItem('user')
  user.value = storedUser ? JSON.parse(storedUser) : null
}, { immediate: true })

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  localStorage.setItem('darkMode', isDark.value.toString())
  document.documentElement.classList.toggle('dark', isDark.value)
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  router.push('/login')
}

onMounted(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>
